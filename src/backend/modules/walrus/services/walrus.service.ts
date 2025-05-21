import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalrusClient } from '@mysten/walrus';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { MIST_PER_SUI, parseStructTag } from '@mysten/sui/utils';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { TESTNET_WALRUS_PACKAGE_CONFIG } from '../../../constants';

@Injectable()
export class WalrusService {
    private readonly logger = new Logger(WalrusService.name);
    private readonly walrusClient: WalrusClient;
    private readonly suiClient: SuiClient;
    private keyPair: Ed25519Keypair;

    constructor(private configService: ConfigService) {
        // Initialize Sui client
        // const rpcUrl = this.configService.get<string>(
        //     'SUI_RPC_URL',
        //     'https://fullnode.testnet.sui.io:443',
        // );

        this.suiClient = new SuiClient({
            url: getFullnodeUrl('testnet'),
        });

        this.getKeypair().then((data) => (this.keyPair = data));

        // Initialize Walrus client
        const networkConfig = this.configService.get<string>(
            'WALRUS_NETWORK',
            'testnet',
        );
        const network = (
            networkConfig === 'mainnet' ? 'mainnet' : 'testnet'
        ) as 'mainnet' | 'testnet';

        // Create client with proper typing
        this.walrusClient = new WalrusClient({
            network,
            suiClient: this.suiClient as any, // Type assertion to bypass incompatible version issue
            storageNodeClientOptions: {
                // @ts-ignore: Suppressing error due to potentially outdated Walrus SDK version where onError might not exist
                onError: (error: Error) => {
                    this.logger.error('Walrus Storage Node Error:', error);
                },
            },
        });

        this.logger.log(`Walrus service initialized with network: ${network}`);
    }

    /**
     * Get a keypair for signing Walrus transactions
     * @returns Ed25519Keypair
     */
    private async getKeypair(): Promise<Ed25519Keypair> {
        const privateKey = process.env.SUI_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('SUI_PRIVATE_KEY not set in .env');
        }

        const keypair = Ed25519Keypair.fromSecretKey(privateKey);
        console.log('Sui Address:', keypair.toSuiAddress());

        const walBalance = await this.suiClient.getBalance({
            owner: keypair.toSuiAddress(),
            coinType: `0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL`,
        });
        console.log('WAL balance:', walBalance.totalBalance);

        if (Number(walBalance.totalBalance) < Number(MIST_PER_SUI) / 1000000) {
            const tx = new Transaction();

            const exchange = await this.suiClient.getObject({
                id: TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0],
                options: { showType: true },
            });

            const exchangePackageId = parseStructTag(
                exchange.data?.type!,
            ).address;

            const wal = tx.moveCall({
                package: exchangePackageId,
                module: 'wal_exchange',
                function: 'exchange_all_for_wal',
                arguments: [
                    tx.object(TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0]),
                    coinWithBalance({
                        type: '0x2::sui::SUI',
                        balance: MIST_PER_SUI / 2n,
                    }),
                ],
            });

            tx.transferObjects([wal], keypair.toSuiAddress());

            const result = await this.suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: { showEffects: true },
            });

            console.log('Exchange result:', result.effects);
        }

        return keypair;
    }

    public async uploadTale(content: string): Promise<string> {
        try {
            console.log('Upload started:');

            let contentBytes = new TextEncoder().encode(content);

            const { blobId } = await this.walrusClient.writeBlob({
                signer: this.keyPair,
                blob: contentBytes,
                deletable: false,
                epochs: 3,
            });
            let aggregatorPrefix = process.env.WALRUS_AGGREGATOR_PREFIX;
            let blobUrl = `${aggregatorPrefix}/v1/blobs/${blobId}`;
            console.log('Blob ID:', blobId);
            console.log('URL:', blobUrl);
            return blobId;
        } catch (error) {
            let message = 'Unknown Error';
            if (error instanceof Error) message = error.message;
            console.error('Upload failed:', message);
            throw error;
        }
    }

    /**
     * Get content from Walrus network
     * @param blobId Blob ID
     * @returns Content as string
     */
    async getContent(blobId: string): Promise<string> {
        try {
            this.logger.log(`Fetching content with blob ID: ${blobId}`);

            // Read blob from Walrus
            const blobBytes = await this.walrusClient.readBlob({ blobId });

            // Convert Uint8Array to string
            const textDecoder = new TextDecoder('utf-8');
            return textDecoder.decode(blobBytes);
        } catch (error) {
            this.logger.error(
                `Failed to fetch content with blob ID ${blobId}:`,
                error,
            );
            throw new Error('Failed to fetch content from Walrus');
        }
    }

    /**
     * Uploads a file buffer to Walrus.
     * @param fileBuffer The buffer of the file to upload.
     * @param deletable Whether the blob should be deletable.
     * @param epochs Number of epochs to store the blob for.
     * @returns An object containing the blobId and the direct URL to the blob.
     */
    public async uploadFileToWalrus(
        fileBuffer: Uint8Array,
        deletable = false,
        epochs = 3,
    ): Promise<{ blobId: string; url: string }> {
        try {
            this.logger.log(
                `Walrus file upload started. Buffer length: ${fileBuffer.length}`,
            );
            if (!this.keyPair) {
                this.logger.warn(
                    'Walrus keyPair not initialized yet, attempting to initialize...',
                );
                this.keyPair = await this.getKeypair();
                this.logger.log('Walrus keyPair initialized.');
            }

            const { blobId } = await this.walrusClient.writeBlob({
                signer: this.keyPair,
                blob: fileBuffer,
                deletable: deletable,
                epochs: epochs,
            });

            // Get base URL from environment variable, with a fallback if not set
            const publisherBaseUrl = this.configService.get<string>(
                'WALRUS_PUBLISHER_BASE_URL',
            );
            if (!publisherBaseUrl) {
                this.logger.error(
                    'WALRUS_PUBLISHER_BASE_URL is not set in environment variables.',
                );
                // Fallback or throw error - for now, let's log an error and potentially use a default or throw
                // For robust behavior, you might want to throw an error here or have a default dev URL
                throw new Error('WALRUS_PUBLISHER_BASE_URL is not configured.');
            }

            const blobUrl = `${publisherBaseUrl.replace(/\/$/, '')}/${blobId}`;
            this.logger.log(
                `File uploaded to Walrus. Blob ID: ${blobId}, URL: ${blobUrl}`,
            );
            return { blobId, url: blobUrl };
        } catch (error) {
            let message = 'Unknown Error';
            if (error instanceof Error) message = error.message;
            this.logger.error('Walrus file upload failed:', message, error);
            throw error;
        }
    }
}
