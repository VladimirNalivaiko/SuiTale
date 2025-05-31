import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalrusClient } from '@mysten/walrus';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { MIST_PER_SUI, parseStructTag } from '@mysten/sui/utils';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { TESTNET_WALRUS_PACKAGE_CONFIG } from '../../../constants';
import { 
    WalrusException,
    BlobEncodingException,
    StorageCostException,
    TransactionBuildException,
    DryRunException,
    WalrusNetworkException,
    InsufficientBalanceException,
    BlobRetrievalException,
    WalrusConfigurationException
} from '../exceptions/walrus.exceptions';

@Injectable()
export class WalrusService {
    private readonly logger = new Logger(WalrusService.name);
    private readonly walrusClient: WalrusClient;
    private readonly suiClient: SuiClient;
    private keyPair: Ed25519Keypair;

    constructor(private configService: ConfigService) {
        // Initialize Sui client
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
        this.logger.log('Sui Address:', keypair.toSuiAddress());

        // Check SUI balance first
        const suiBalance = await this.suiClient.getBalance({
            owner: keypair.toSuiAddress(),
            coinType: '0x2::sui::SUI',
        });
        const suiTokens = Number(suiBalance.totalBalance) / Number(MIST_PER_SUI);
        this.logger.log(`SUI balance: ${suiBalance.totalBalance} MIST (${suiTokens.toFixed(6)} SUI)`);

        const walBalance = await this.suiClient.getBalance({
            owner: keypair.toSuiAddress(),
            coinType: `0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL`,
        });
        const walTokens = Number(walBalance.totalBalance) / Number(MIST_PER_SUI);
        this.logger.log(`WAL balance: ${walBalance.totalBalance} MIST (${walTokens.toFixed(6)} WAL)`);

        // Required SUI for gas (let's keep 0.2 SUI minimum for operations)
        const requiredSuiBalance = MIST_PER_SUI / 5n; // 0.2 SUI
        const requiredSuiTokens = Number(requiredSuiBalance) / Number(MIST_PER_SUI);
        
        if (BigInt(suiBalance.totalBalance) < requiredSuiBalance) {
            this.logger.log(`Insufficient SUI for gas. Current: ${suiBalance.totalBalance} MIST (${suiTokens.toFixed(6)} SUI), Required: ${requiredSuiBalance} MIST (${requiredSuiTokens.toFixed(1)} SUI)`);
            
            // Check if we have WAL to exchange
            if (Number(walBalance.totalBalance) < Number(MIST_PER_SUI) / 1000000) {
                throw new Error('Insufficient both SUI and WAL balances for operations');
            }

            // Exchange WAL for SUI
            this.logger.log('Exchanging WAL for SUI...');
            const tx = new Transaction();

            const exchange = await this.suiClient.getObject({
                id: TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0],
                options: { showType: true },
            });

            const exchangePackageId = parseStructTag(
                exchange.data?.type!,
            ).address;

            // Exchange WAL for SUI
            const sui = tx.moveCall({
                package: exchangePackageId,
                module: 'wal_exchange',
                function: 'exchange_all_for_sui',
                arguments: [
                    tx.object(TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0]),
                    coinWithBalance({
                        type: '0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL',
                        balance: BigInt(walBalance.totalBalance) / 2n, // Exchange half of WAL
                    }),
                ],
            });

            tx.transferObjects([sui], keypair.toSuiAddress());

            const result = await this.suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: { showEffects: true },
            });

            this.logger.log('WAL->SUI Exchange result:', result.effects);
            
            // Check new balances
            const newSuiBalance = await this.suiClient.getBalance({
                owner: keypair.toSuiAddress(),
                coinType: '0x2::sui::SUI',
            });
            const newSuiTokens = Number(newSuiBalance.totalBalance) / Number(MIST_PER_SUI);
            this.logger.log(`New SUI balance after exchange: ${newSuiBalance.totalBalance} MIST (${newSuiTokens.toFixed(6)} SUI)`);
        }

        // Check WAL balance and exchange SUI for WAL if needed (for storage costs)
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
                        balance: MIST_PER_SUI / 4n, // Exchange 0.25 SUI for WAL
                    }),
                ],
            });

            tx.transferObjects([wal], keypair.toSuiAddress());

            const result = await this.suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: { showEffects: true },
            });

            this.logger.log('SUI->WAL Exchange result:', result.effects);
        }

        return keypair;
    }

    /**
     * Get content from Walrus by blob ID
     */
    async getContent(blobId: string): Promise<string> {
        try {
            const aggregatorUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`;
            const response = await fetch(aggregatorUrl);
            
            if (!response.ok) {
                this.logger.error(`Failed to get content from Walrus: ${response.status} ${response.statusText}`);
                throw new BlobRetrievalException(blobId, `Failed to retrieve blob from Walrus: ${response.status} ${response.statusText}`, {
                    url: aggregatorUrl,
                    status: response.status
                });
            }
            
            const content = await response.text();
            this.logger.log(`Retrieved content from Walrus blob ${blobId}, size: ${content.length} characters`);
            return content;
            
        } catch (error) {
            if (error instanceof WalrusException) {
                throw error;
            }
            
            this.logger.error(`Error getting content from Walrus blob ${blobId}:`, error);
            throw new BlobRetrievalException(blobId, `Failed to get content from blob: ${error.message}`, {
                originalError: error.message
            });
        }
    }

    /**
     * Exchange SUI tokens for WAL tokens using Walrus exchange
     * This method is exposed via API for testing/admin purposes
     */
    public async exchangeSuiForWal(suiAmount: number): Promise<{
        success: boolean;
        exchangedSui: number;
        receivedWal: number;
        transactionDigest: string;
        newBalances: { sui: number; wal: number };
    }> {
        this.logger.log(`Starting SUI->WAL exchange: ${suiAmount} SUI`);
        
        const keypair = await this.getKeypair();
        
        // Validate SUI amount
        if (suiAmount <= 0) {
            throw new Error('Invalid SUI amount. Must be greater than 0');
        }
        
        const suiAmountMist = BigInt(Math.floor(suiAmount * Number(MIST_PER_SUI)));
        
        // Check current balances
        const [initialSuiBalance, initialWalBalance] = await Promise.all([
            this.suiClient.getBalance({
                owner: keypair.toSuiAddress(),
                coinType: '0x2::sui::SUI',
            }),
            this.suiClient.getBalance({
                owner: keypair.toSuiAddress(),
                coinType: '0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL',
            }),
        ]);
        
        // Check if we have enough SUI
        if (BigInt(initialSuiBalance.totalBalance) < suiAmountMist) {
            throw new Error(`Insufficient SUI balance. Required: ${suiAmount} SUI, Available: ${Number(initialSuiBalance.totalBalance) / Number(MIST_PER_SUI)} SUI`);
        }
        
        try {
            // Create exchange transaction
            const tx = new Transaction();
            
            const exchange = await this.suiClient.getObject({
                id: TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0],
                options: { showType: true },
            });
            
            const exchangePackageId = parseStructTag(exchange.data?.type!).address;
            
            // Exchange SUI for WAL
            const wal = tx.moveCall({
                package: exchangePackageId,
                module: 'wal_exchange',
                function: 'exchange_all_for_wal',
                arguments: [
                    tx.object(TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0]),
                    coinWithBalance({
                        type: '0x2::sui::SUI',
                        balance: suiAmountMist,
                    }),
                ],
            });
            
            tx.transferObjects([wal], keypair.toSuiAddress());
            
            // Execute transaction
            const result = await this.suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: { showEffects: true, showEvents: true },
            });
            
            this.logger.log(`Exchange transaction executed: ${result.digest}`);
            
            // Get new balances
            const [newSuiBalance, newWalBalance] = await Promise.all([
                this.suiClient.getBalance({
                    owner: keypair.toSuiAddress(),
                    coinType: '0x2::sui::SUI',
                }),
                this.suiClient.getBalance({
                    owner: keypair.toSuiAddress(),
                    coinType: '0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL',
                }),
            ]);
            
            const exchangedSuiTokens = Number(BigInt(initialSuiBalance.totalBalance) - BigInt(newSuiBalance.totalBalance)) / Number(MIST_PER_SUI);
            const receivedWalTokens = Number(BigInt(newWalBalance.totalBalance) - BigInt(initialWalBalance.totalBalance)) / Number(MIST_PER_SUI);
            
            this.logger.log(`Exchange completed: Exchanged ${exchangedSuiTokens.toFixed(6)} SUI for ${receivedWalTokens.toFixed(6)} WAL`);
            
            return {
                success: true,
                exchangedSui: exchangedSuiTokens,
                receivedWal: receivedWalTokens,
                transactionDigest: result.digest,
                newBalances: {
                    sui: Number(newSuiBalance.totalBalance) / Number(MIST_PER_SUI),
                    wal: Number(newWalBalance.totalBalance) / Number(MIST_PER_SUI),
                },
            };
            
        } catch (error) {
            this.logger.error(`Exchange failed: ${error.message}`, error.stack);
            throw new Error(`Token exchange failed: ${error.message}`);
        }
    }
}
