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
        const rpcUrl = this.configService.get<string>(
            'SUI_RPC_URL',
            'https://fullnode.testnet.sui.io:443',
        );

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

        if (Number(walBalance.totalBalance) < Number(MIST_PER_SUI) / 1000) {
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

            console.log('Blob ID:', blobId);
            console.log(
                'URL:',
                `https://cache.testnet.walrus.xyz/blob/${blobId}`,
            );
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
}
