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
     * Calculate costs for Walrus operations without executing them
     * @param content Content to upload
     * @returns Cost estimation in WAL and SUI
     */
    public async calculateUploadCosts(content: string): Promise<{
        storageCost: { wal: number; mist: string };
        gasCosts: {
            createStorage: { sui: number; mist: string };
            registerBlob: { sui: number; mist: string };
            certifyBlob: { sui: number; mist: string };
            total: { sui: number; mist: string };
        };
        totalCostEstimate: { 
            walTokens: number; 
            suiTokens: number;
            walMist: string;
            suiMist: string;
        };
    }> {
        try {
            if (!this.keyPair) {
                this.keyPair = await this.getKeypair();
            }

            const contentBytes = new TextEncoder().encode(content);
            const epochs = 5;
            
            // 1. Calculate storage cost
            const { blobId, metadata } = await this.walrusClient.encodeBlob(contentBytes);
            const unencodedLength = parseInt(String(metadata.V1.unencoded_length), 10);
            
            const { storageCost, totalCost, writeCost } = await this.walrusClient.storageCost(
                unencodedLength,
                epochs,
            );

            // 2. Estimate gas costs via dry runs
            const createStorageTx = await this.walrusClient.createStorageTransaction({
                size: unencodedLength,
                epochs: epochs,
                owner: this.keyPair.toSuiAddress(),
            });
            createStorageTx.setSender(this.keyPair.toSuiAddress());
            
            const serializedCreateStorageTx = await createStorageTx.build({ client: this.suiClient as any });
            const dryRunCreateStorage = await this.suiClient.dryRunTransactionBlock({
                transactionBlock: serializedCreateStorageTx,
            });

            const registerBlobTx = await this.walrusClient.registerBlobTransaction({
                owner: this.keyPair.toSuiAddress(),
                blobId: blobId,
                rootHash: new Uint8Array(), // Mock for estimation
                size: unencodedLength,
                deletable: false,
                epochs: epochs,
            });
            registerBlobTx.setSender(this.keyPair.toSuiAddress());
            
            const serializedRegisterBlobTx = await registerBlobTx.build({ client: this.suiClient as any });
            const dryRunRegisterBlob = await this.suiClient.dryRunTransactionBlock({
                transactionBlock: serializedRegisterBlobTx,
            });

            // Calculate gas costs
            const createStorageGas = BigInt(dryRunCreateStorage.effects.gasUsed.computationCost) + 
                                   BigInt(dryRunCreateStorage.effects.gasUsed.storageCost);
            const registerBlobGas = BigInt(dryRunRegisterBlob.effects.gasUsed.computationCost) + 
                                  BigInt(dryRunRegisterBlob.effects.gasUsed.storageCost);
            const certifyBlobGas = BigInt(5000000); // Estimated 5M MIST for certify
            const totalGas = createStorageGas + registerBlobGas + certifyBlobGas;

            // Convert to tokens
            const storageCostWal = Number(storageCost) / Number(MIST_PER_SUI);
            const createStorageGasSui = Number(createStorageGas) / Number(MIST_PER_SUI);
            const registerBlobGasSui = Number(registerBlobGas) / Number(MIST_PER_SUI);
            const certifyBlobGasSui = Number(certifyBlobGas) / Number(MIST_PER_SUI);
            const totalGasSui = Number(totalGas) / Number(MIST_PER_SUI);

            return {
                storageCost: {
                    wal: storageCostWal,
                    mist: storageCost.toString()
                },
                gasCosts: {
                    createStorage: {
                        sui: createStorageGasSui,
                        mist: createStorageGas.toString()
                    },
                    registerBlob: {
                        sui: registerBlobGasSui,
                        mist: registerBlobGas.toString()
                    },
                    certifyBlob: {
                        sui: certifyBlobGasSui,
                        mist: certifyBlobGas.toString()
                    },
                    total: {
                        sui: totalGasSui,
                        mist: totalGas.toString()
                    }
                },
                totalCostEstimate: {
                    walTokens: storageCostWal,
                    suiTokens: totalGasSui,
                    walMist: storageCost.toString(),
                    suiMist: totalGas.toString()
                }
            };

        } catch (error) {
            this.logger.error('Failed to calculate upload costs:', error);
            throw new Error('Failed to calculate upload costs');
        }
    }

    public async uploadTale(content: string): Promise<string> {
        try {
            this.logger.log('Walrus uploadTale started using low-level methods.');
            if (!this.keyPair) {
                this.logger.warn('Walrus keyPair not initialized yet, attempting to initialize...');
                this.keyPair = await this.getKeypair();
                this.logger.log('Walrus keyPair initialized.');
            }

            // Check SUI balance before operations
            const suiBalance = await this.suiClient.getBalance({
                owner: this.keyPair.toSuiAddress(),
                coinType: '0x2::sui::SUI',
            });
            const suiTokens = Number(suiBalance.totalBalance) / Number(MIST_PER_SUI);
            this.logger.log(`Current SUI balance before operations: ${suiBalance.totalBalance} MIST (${suiTokens.toFixed(6)} SUI)`);
            
            // If still insufficient, try to re-initialize keypair (which includes exchange logic)
            const minRequiredSui = MIST_PER_SUI / 10n; // 0.1 SUI minimum
            if (BigInt(suiBalance.totalBalance) < minRequiredSui) {
                this.logger.warn(`Still insufficient SUI, attempting to reinitialize keypair... Need ${minRequiredSui} MIST (0.1 SUI)`);
                this.keyPair = await this.getKeypair();
                
                // Check again
                const newSuiBalance = await this.suiClient.getBalance({
                    owner: this.keyPair.toSuiAddress(),
                    coinType: '0x2::sui::SUI',
                });
                const newSuiTokens = Number(newSuiBalance.totalBalance) / Number(MIST_PER_SUI);
                
                if (BigInt(newSuiBalance.totalBalance) < minRequiredSui) {
                    throw new Error(`Insufficient SUI balance for gas operations. Current: ${newSuiBalance.totalBalance} MIST (${newSuiTokens.toFixed(6)} SUI), Required: ${minRequiredSui} MIST (0.1 SUI)`);
                }
                
                this.logger.log(`SUI balance after reinitialization: ${newSuiBalance.totalBalance} MIST (${newSuiTokens.toFixed(6)} SUI)`);
            }

            const contentBytes = new TextEncoder().encode(content);
            const epochs = 5; // Keep epochs at 5
            const deletable = false; // Or a default value / from configuration

            // 1. Encode Blob
            this.logger.debug('Step 1: Encoding blob...');
            this.logger.debug(`Initial contentBytes length: ${contentBytes.length}`);
            const { blobId, metadata, sliversByNode, rootHash } = await this.walrusClient.encodeBlob(
                contentBytes,
            );
            this.logger.debug(`Blob encoded. Blob ID: ${blobId}, Root Hash: ${rootHash}`);
            const unencodedLength = parseInt(String(metadata.V1.unencoded_length), 10);
            this.logger.debug(`Derived unencodedLength: ${unencodedLength}`);

            // 2. Calculate Storage Cost (optional, for information)
            this.logger.debug('Step 2: Calculating storage cost...');
            const { storageCost, totalCost, writeCost } = await this.walrusClient.storageCost(
                unencodedLength,
                epochs,
            );
            const storageCostWal = Number(storageCost) / Number(MIST_PER_SUI);
            const writeCostWal = Number(writeCost) / Number(MIST_PER_SUI);
            const totalCostWal = Number(totalCost) / Number(MIST_PER_SUI);
            
            this.logger.log(`Calculated Walrus storage cost: ${storageCost} MIST (${storageCostWal.toFixed(6)} WAL), writeCost: ${writeCost} MIST (${writeCostWal.toFixed(6)} WAL), totalCost: ${totalCost} MIST (${totalCostWal.toFixed(6)} WAL)`);
            // WAL balance check can be added here if necessary

            // 3. Create Storage Object
            this.logger.debug('Step 3: Creating Storage Object...');
            this.logger.debug(`Using unencodedLength for createStorageTransaction: ${unencodedLength}, epochs: ${epochs}`);
            const createStorageTx = await this.walrusClient.createStorageTransaction({
                size: unencodedLength,
                epochs: epochs,
                owner: this.keyPair.toSuiAddress(),
            });

            createStorageTx.setSender(this.keyPair.toSuiAddress()); // Set sender before building
            // Remove manual gas budget - we'll calculate it dynamically
            
            this.logger.debug('Building createStorageTx for dry run...');
            const serializedCreateStorageTx = await createStorageTx.build({ client: this.suiClient as any });
            this.logger.debug('Executing dryRun for createStorageTx...');
            const dryRunCreateStorage = await this.suiClient.dryRunTransactionBlock({
                transactionBlock: serializedCreateStorageTx,
            });

            if (dryRunCreateStorage.effects.status.status !== 'success') {
                this.logger.error('Dry run for createStorageTransaction failed:', dryRunCreateStorage.effects.status.error);
                throw new Error(`Dry run for createStorageTransaction failed: ${dryRunCreateStorage.effects.status.error}`);
            }
            
            // Calculate dynamic gas budget based on dry run results
            const baseCost = BigInt(dryRunCreateStorage.effects.gasUsed.computationCost) + 
                           BigInt(dryRunCreateStorage.effects.gasUsed.storageCost);
            const gasBuffer = baseCost / 10n; // 10% buffer (reduced from 20%)
            const dynamicGasBudget = Math.min(Number(baseCost + gasBuffer), Number(MIST_PER_SUI / 10n)); // Max 0.1 SUI
            
            const baseCostSui = Number(baseCost) / Number(MIST_PER_SUI);
            const dynamicGasBudgetSui = dynamicGasBudget / Number(MIST_PER_SUI);
            
            this.logger.debug(`Dry run gas usage: computation=${dryRunCreateStorage.effects.gasUsed.computationCost}, storage=${dryRunCreateStorage.effects.gasUsed.storageCost}`);
            this.logger.debug(`Calculated dynamic gas budget: ${dynamicGasBudget} MIST (${dynamicGasBudgetSui.toFixed(6)} SUI) - base: ${baseCost} MIST (${baseCostSui.toFixed(6)} SUI) + buffer: ${gasBuffer} MIST`);
            
            // Set the calculated gas budget
            createStorageTx.setGasBudget(dynamicGasBudget);

            this.logger.debug('Executing signAndExecuteTransaction for createStorageTx...');
            const createStorageResult = await this.suiClient.signAndExecuteTransaction({
                transaction: createStorageTx as any, // as any for transaction remains
                signer: this.keyPair,
                options: { showEffects: true, showObjectChanges: true },
            });

            if (createStorageResult.effects?.status.status !== 'success') {
                this.logger.error('createStorageTransaction failed:', createStorageResult.effects?.status.error);
                throw new Error(`createStorageTransaction failed: ${createStorageResult.effects?.status.error}`);
            }
            this.logger.log(`createStorageTransaction successful. Digest: ${createStorageResult.digest}`);
            
            const createdStorageObject = createStorageResult.objectChanges?.find(
                (objChange) => objChange.type === 'created' && 
                (objChange.objectType.endsWith('::storage_resource::Storage') || 
                 objChange.objectType.endsWith('::walrus_subsidies::Storage'))
            );
            if (!createdStorageObject || !('objectId' in createdStorageObject)) {
                 this.logger.error('Could not find created Storage object ID from createStorageResult', createStorageResult.objectChanges);
                 this.logger.error('Available created objects:', createStorageResult.objectChanges?.filter(obj => obj.type === 'created'));
                 throw new Error('Could not find created Storage object ID');
            }
            const storageId = createdStorageObject.objectId;
            this.logger.debug(`Storage Object created with ID: ${storageId}, Type: ${createdStorageObject.objectType}`);

            // 4. Register Blob
            this.logger.debug('Step 4: Registering Blob...');
            
            const registerBlobTx = await this.walrusClient.registerBlobTransaction({
                owner: this.keyPair.toSuiAddress(),
                blobId: blobId,
                rootHash: rootHash,
                size: unencodedLength,
                deletable: deletable,
                epochs: epochs,
                // storageId: storageId, // We removed this as per SDK changes
                // encodingType: contractEncodingType, // We removed this as per SDK changes
            });

            registerBlobTx.setSender(this.keyPair.toSuiAddress()); // Set sender before building
            // Remove manual gas budget - we'll calculate it dynamically

            this.logger.debug('Building registerBlobTx for dry run...');
            const serializedRegisterBlobTx = await registerBlobTx.build({ client: this.suiClient as any });
            this.logger.debug('Executing dryRun for registerBlobTx...');
            const dryRunRegisterBlob = await this.suiClient.dryRunTransactionBlock({
                transactionBlock: serializedRegisterBlobTx,
            });

            if (dryRunRegisterBlob.effects.status.status !== 'success') {
                this.logger.error('Dry run for registerBlobTransaction failed:', dryRunRegisterBlob.effects.status.error);
                throw new Error(`Dry run for registerBlobTransaction failed: ${dryRunRegisterBlob.effects.status.error}`);
            }
            
            // Calculate dynamic gas budget based on dry run results
            const baseCostRegister = BigInt(dryRunRegisterBlob.effects.gasUsed.computationCost) + 
                                   BigInt(dryRunRegisterBlob.effects.gasUsed.storageCost);
            const gasBufferRegister = baseCostRegister / 10n; // 10% buffer (reduced from 20%)
            const dynamicGasBudgetRegister = Math.min(Number(baseCostRegister + gasBufferRegister), Number(MIST_PER_SUI / 20n)); // Max 0.05 SUI
            
            this.logger.debug(`Register dry run gas usage: computation=${dryRunRegisterBlob.effects.gasUsed.computationCost}, storage=${dryRunRegisterBlob.effects.gasUsed.storageCost}`);
            this.logger.debug(`Calculated dynamic gas budget for register: ${dynamicGasBudgetRegister} (base: ${baseCostRegister} + buffer: ${gasBufferRegister})`);
            
            // Set the calculated gas budget
            registerBlobTx.setGasBudget(dynamicGasBudgetRegister);

            this.logger.debug('Executing signAndExecuteTransaction for registerBlobTx...');
            const registerBlobResult = await this.suiClient.signAndExecuteTransaction({
                transaction: registerBlobTx as any, // as any for transaction
                signer: this.keyPair,
                options: { showEffects: true, showObjectChanges: true },
            });

            if (registerBlobResult.effects?.status.status !== 'success') {
                this.logger.error('registerBlobTransaction failed:', registerBlobResult.effects?.status.error);
                throw new Error(`registerBlobTransaction failed: ${registerBlobResult.effects?.status.error}`);
            }
            this.logger.log(`registerBlobTransaction successful. Digest: ${registerBlobResult.digest}`);
            
            const createdBlobObject = registerBlobResult.objectChanges?.find(
                (objChange) => objChange.type === 'created' && 
                (objChange.objectType.endsWith('::blob::Blob') || 
                 objChange.objectType.endsWith('::walrus::Blob'))
            );
             if (!createdBlobObject || !('objectId' in createdBlobObject)) {
                 this.logger.error('Could not find created Blob object ID from registerBlobResult', registerBlobResult.objectChanges);
                 this.logger.error('Available created objects:', registerBlobResult.objectChanges?.filter(obj => obj.type === 'created'));
                 throw new Error('Could not find created Blob object ID');
            }
            const blobObjectId = createdBlobObject.objectId; 
            this.logger.debug(`Blob Object (metadata) created with ID: ${blobObjectId}, Type: ${createdBlobObject.objectType}`);

            // 5. Write Encoded Blob to Nodes
            this.logger.debug('Step 5: Writing encoded blob to Walrus storage nodes...');
            
            // Add delay to ensure blob registration is propagated
            this.logger.debug('Waiting 3 seconds for blob registration to propagate...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            try {
                await this.walrusClient.writeEncodedBlobToNodes({
                    blobId: blobId,
                    metadata: metadata,
                    sliversByNode: sliversByNode,
                    objectId: blobObjectId,
                    deletable: deletable,
                });
                this.logger.log('Blob content successfully written to Walrus storage nodes.');
            } catch (writeError) {
                this.logger.warn('Failed to write to Walrus storage nodes, but blob is registered on blockchain:', writeError);
                this.logger.log('Blob is still accessible via blockchain, continuing...');
                // Don't throw error here - blob is registered on blockchain even if nodes fail
            }

            // 6. Certify Blob (Optional, but recommended)
            try {
                this.logger.debug('Step 6: Certifying Blob (attempting)...');
                
                // Skip certification if we had issues with storage nodes
                this.logger.debug('Attempting blob certification...');
                
                 const certifyBlobTx = await this.walrusClient.certifyBlobTransaction({
                    blobId: blobId,
                    blobObjectId: blobObjectId,
                    confirmations: [], // Confirmations are usually gathered after writing to nodes
                    deletable: deletable,
                 });

                 certifyBlobTx.setSender(this.keyPair.toSuiAddress()); // Set sender before building
                 // Remove manual gas budget - we'll calculate it dynamically

                this.logger.debug('Building certifyBlobTx for dry run...');
                const serializedCertifyBlobTx = await certifyBlobTx.build({ client: this.suiClient as any });
                this.logger.debug('Executing dryRun for certifyBlobTx...');
                const dryRunCertifyBlob = await this.suiClient.dryRunTransactionBlock({
                     transactionBlock: serializedCertifyBlobTx,
                });

                if (dryRunCertifyBlob.effects.status.status !== 'success') {
                    this.logger.warn('Dry run for certifyBlobTransaction failed, skipping certification:', dryRunCertifyBlob.effects.status.error);
                } else {
                    // Calculate dynamic gas budget based on dry run results
                    const baseCostCertify = BigInt(dryRunCertifyBlob.effects.gasUsed.computationCost) + 
                                          BigInt(dryRunCertifyBlob.effects.gasUsed.storageCost);
                    const gasBufferCertify = baseCostCertify / 20n; // 5% buffer (smaller for certify)
                    const dynamicGasBudgetCertify = Math.min(Number(baseCostCertify + gasBufferCertify), Number(MIST_PER_SUI / 50n)); // Max 0.02 SUI
                    
                    this.logger.debug(`Certify dry run gas usage: computation=${dryRunCertifyBlob.effects.gasUsed.computationCost}, storage=${dryRunCertifyBlob.effects.gasUsed.storageCost}`);
                    this.logger.debug(`Calculated dynamic gas budget for certify: ${dynamicGasBudgetCertify} (base: ${baseCostCertify} + buffer: ${gasBufferCertify})`);
                    
                    // Set the calculated gas budget
                    certifyBlobTx.setGasBudget(dynamicGasBudgetCertify);

                    this.logger.debug('Executing signAndExecuteTransaction for certifyBlobTx...');
                    const certifyBlobResult = await this.suiClient.signAndExecuteTransaction({
                        transaction: certifyBlobTx as any, // as any for transaction
                        signer: this.keyPair,
                        options: { showEffects: true },
                    });
                    if (certifyBlobResult.effects?.status.status === 'success') {
                        this.logger.log(`certifyBlobTransaction successful. Digest: ${certifyBlobResult.digest}`);
                    } else {
                        this.logger.warn('certifyBlobTransaction failed:', certifyBlobResult.effects?.status.error);
                    }
                }
            } catch (certError) {
                this.logger.warn('Skipping blob certification due to an error during the process:', certError);
            }

            this.logger.log(`Walrus uploadTale finished successfully. Blob ID: ${blobId}`);
            
            const publisherBaseUrl = this.configService.get<string>(
                'WALRUS_PUBLISHER_BASE_URL',
                'https://agg.test.walrus.eosusa.io'
            );
            const blobUrl = `${publisherBaseUrl.replace(/\/$/, '')}/blob/${blobId}`;
            this.logger.debug(`Blob URL: ${blobUrl}`);
            
            // Test blob accessibility
            try {
                this.logger.debug(`Testing blob accessibility at: ${blobUrl}`);
                const response = await fetch(blobUrl, { method: 'HEAD' });
                if (response.ok) {
                    this.logger.log(`✅ Blob is accessible at: ${blobUrl}`);
                } else {
                    this.logger.warn(`⚠️ Blob may not be immediately accessible (HTTP ${response.status}), but is registered on blockchain`);
                }
            } catch (fetchError) {
                this.logger.warn(`⚠️ Could not test blob accessibility, but it is registered on blockchain:`, fetchError);
            }
            
            return blobId;
        } catch (error) {
            let message = 'Unknown Error during low-level Walrus upload';
            if (error instanceof Error) {
                message = error.message;
                 this.logger.error('Walrus uploadTale (low-level) raw error object:', error);
                if ('cause' in error && error.cause && typeof error.cause === 'object') {
                    this.logger.error('Detailed cause from error (low-level):', JSON.stringify(error.cause, null, 2));
                    // @ts-ignore
                    if (error.cause.executionErrorSource) {
                        // @ts-ignore
                         message += ` | ExecutionError: ${error.cause.executionErrorSource}`;
                    }
                } else {
                    this.logger.error('Error object (low-level) does not have a structured cause property or it is not an object.');
                }
            } else {
                 this.logger.error('Caught non-Error object (low-level):', error);
            }
            this.logger.error('Walrus uploadTale (low-level) failed:', message);
            this.logger.error('Upload failed (low-level):', message, error);
            throw error;
        }
    }

    /**
     * Get content from Walrus network
     * @param blobId Blob ID
     * @returns Content as string
     */
    async getContent(blobId: string): Promise<string> {
        if (!blobId || blobId.trim().length === 0) {
            throw new BlobRetrievalException('', 'Blob ID cannot be empty', { blobId });
        }

        this.logger.log(`Fetching content with blob ID: ${blobId}`);

        try {
            const blobBytes = await this.retryOperation(
                async () => {
                    return await this.walrusClient.readBlob({ blobId });
                },
                3,
                `Content retrieval for blob ${blobId}`,
                (error) => new BlobRetrievalException(
                    blobId, 
                    `Network error: ${error.message}`,
                    { 
                        operation: 'readBlob',
                        networkStatus: 'unavailable'
                    }
                )
            );

            if (!blobBytes || blobBytes.length === 0) {
                throw new BlobRetrievalException(blobId, 'Retrieved empty content', {
                    retrievedSize: blobBytes?.length || 0
                });
            }

            // Convert Uint8Array to string with proper error handling
            try {
                const textDecoder = new TextDecoder('utf-8');
                const content = textDecoder.decode(blobBytes);
                
                this.logger.debug(`✅ Content retrieved successfully: ${content.length} characters`);
                return content;
            } catch (decodingError) {
                throw new BlobRetrievalException(blobId, `Failed to decode content: ${decodingError.message}`, {
                    blobSize: blobBytes.length,
                    encoding: 'utf-8'
                });
            }
        } catch (error) {
            if (error instanceof WalrusException) {
                throw error;
            }
            
            this.logger.error(`❌ Failed to fetch content with blob ID ${blobId}:`, error);
            throw new BlobRetrievalException(blobId, `Unexpected error: ${error.message}`, {
                originalError: error.message
            });
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
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new BlobEncodingException('File buffer cannot be empty', {
                bufferLength: fileBuffer?.length || 0
            });
        }

        const maxFileSize = 100 * 1024 * 1024; // 100MB
        if (fileBuffer.length > maxFileSize) {
            throw new BlobEncodingException(`File too large: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB (max: 100MB)`, {
                actualSize: fileBuffer.length,
                maxSize: maxFileSize
            });
        }

        this.logger.log(`Walrus file upload started. Buffer length: ${fileBuffer.length}`);

        try {
            if (!this.keyPair) {
                this.logger.warn('Walrus keyPair not initialized yet, attempting to initialize...');
                this.keyPair = await this.getKeypair();
                this.logger.log('Walrus keyPair initialized.');
            }

            const { blobId } = await this.retryOperation(
                async () => {
                    return await this.walrusClient.writeBlob({
                        signer: this.keyPair,
                        blob: fileBuffer,
                        deletable: deletable,
                        epochs: epochs,
                    });
                },
                3,
                'File upload to Walrus',
                (error) => new WalrusNetworkException(`Failed to upload file: ${error.message}`, {
                    fileSize: fileBuffer.length,
                    epochs,
                    deletable
                })
            );

            // Get base URL from environment variable
            const publisherBaseUrl = this.configService.get<string>('WALRUS_PUBLISHER_BASE_URL');
            if (!publisherBaseUrl) {
                throw new WalrusConfigurationException('WALRUS_PUBLISHER_BASE_URL', {
                    operation: 'uploadFileToWalrus'
                });
            }

            const blobUrl = `${publisherBaseUrl.replace(/\/$/, '')}/${blobId}`;
            this.logger.log(`✅ File uploaded to Walrus. Blob ID: ${blobId}, URL: ${blobUrl}`);
            
            return { blobId, url: blobUrl };
        } catch (error) {
            if (error instanceof WalrusException) {
                throw error;
            }
            
            this.logger.error('❌ Walrus file upload failed:', error);
            throw new WalrusNetworkException(`Unexpected upload error: ${error.message}`, {
                fileSize: fileBuffer.length,
                originalError: error.message
            });
        }
    }

    /**
     * Prepare batch upload transaction for cover image and content
     * @param userAddress User's wallet address
     * @param content Tale content as string
     * @param coverImageBuffer Cover image as buffer
     * @param title Title for the transaction
     * @returns Batch transaction data with costs and metadata
     */
    public async prepareBatchUpload(
        userAddress: string,
        content: string, 
        coverImageBuffer: Buffer,
        title?: string  // Add title parameter for better transaction description
    ): Promise<{
        costs: {
            coverBlob: { wal: number; mist: string };
            contentBlob: { wal: number; mist: string };
            totalGas: { sui: number; mist: string };
            total: {
                walTokens: number;
                suiTokens: number;
                walMist: string;
                suiMist: string;
            };
        };
        transaction: string; // serialized batch transaction
        metadata: {
            coverBlobId: string;
            contentBlobId: string;
            estimatedTime: string;
        };
    }> {
        const operation = title ? `"${title}"` : 'batch upload';
        this.logger.log(`Starting batch upload preparation for ${operation}`);
        
        try {
            // Validate inputs
            if (!userAddress) {
                throw new TransactionBuildException('User address is required', { userAddress });
            }
            if (!content || content.trim().length === 0) {
                throw new BlobEncodingException('Content cannot be empty', { contentLength: content?.length || 0 });
            }
            if (!coverImageBuffer || coverImageBuffer.length === 0) {
                throw new BlobEncodingException('Cover image buffer cannot be empty', { bufferLength: coverImageBuffer?.length || 0 });
            }

            // Check file size limits
            const maxCoverSize = 10 * 1024 * 1024; // 10MB
            const maxContentSize = 50 * 1024 * 1024; // 50MB
            
            if (coverImageBuffer.length > maxCoverSize) {
                throw new BlobEncodingException(`Cover image too large: ${(coverImageBuffer.length / 1024 / 1024).toFixed(2)}MB (max: 10MB)`, {
                    actualSize: coverImageBuffer.length,
                    maxSize: maxCoverSize
                });
            }
            
            if (Buffer.byteLength(content, 'utf8') > maxContentSize) {
                throw new BlobEncodingException(`Content too large: ${(Buffer.byteLength(content, 'utf8') / 1024 / 1024).toFixed(2)}MB (max: 50MB)`, {
                    actualSize: Buffer.byteLength(content, 'utf8'),
                    maxSize: maxContentSize
                });
            }
            
            // 1. Encode both blobs with retry logic
            this.logger.debug('Step 1: Encoding cover image blob...');
            const { coverBlobId, coverMetadata, coverRootHash } = await this.retryOperation(
                async () => {
                    const result = await this.walrusClient.encodeBlob(new Uint8Array(coverImageBuffer));
                    return {
                        coverBlobId: result.blobId,
                        coverMetadata: result.metadata,
                        coverRootHash: result.rootHash
                    };
                },
                3,
                'Cover image encoding',
                (error) => new BlobEncodingException(`Failed to encode cover image: ${error.message}`, {
                    bufferSize: coverImageBuffer.length,
                    operation: 'encodeBlob',
                    attempt: 'all retries exhausted'
                })
            );
            
            this.logger.debug('Step 2: Encoding content blob...');
            const contentBytes = new TextEncoder().encode(content);
            const { contentBlobId, contentMetadata, contentRootHash } = await this.retryOperation(
                async () => {
                    const result = await this.walrusClient.encodeBlob(contentBytes);
                    return {
                        contentBlobId: result.blobId,
                        contentMetadata: result.metadata,
                        contentRootHash: result.rootHash
                    };
                },
                3,
                'Content encoding',
                (error) => new BlobEncodingException(`Failed to encode content: ${error.message}`, {
                    contentSize: contentBytes.length,
                    operation: 'encodeBlob',
                    attempt: 'all retries exhausted'
                })
            );
            
            this.logger.debug(`✅ Blobs encoded - Cover: ${coverBlobId}, Content: ${contentBlobId}`);
            
            // 2. Calculate storage costs for both blobs
            const epochs = 5;
            let coverUnencodedLength: number;
            let contentUnencodedLength: number;
            
            try {
                coverUnencodedLength = parseInt(String(coverMetadata.V1.unencoded_length), 10);
                contentUnencodedLength = parseInt(String(contentMetadata.V1.unencoded_length), 10);
                
                if (isNaN(coverUnencodedLength) || isNaN(contentUnencodedLength)) {
                    throw new Error('Invalid unencoded length values');
                }
            } catch (error) {
                throw new BlobEncodingException('Failed to parse blob metadata', {
                    coverMetadata: coverMetadata.V1,
                    contentMetadata: contentMetadata.V1,
                    error: error.message
                });
            }
            
            this.logger.debug('Step 3: Calculating storage costs...');
            const { coverStorageCosts, contentStorageCosts } = await this.retryOperation(
                async () => {
                    const [cover, content] = await Promise.all([
                        this.walrusClient.storageCost(coverUnencodedLength, epochs),
                        this.walrusClient.storageCost(contentUnencodedLength, epochs)
                    ]);
                    return {
                        coverStorageCosts: cover,
                        contentStorageCosts: content
                    };
                },
                3,
                'Storage cost calculation',
                (error) => new StorageCostException(`Failed to calculate storage costs: ${error.message}`, {
                    coverSize: coverUnencodedLength,
                    contentSize: contentUnencodedLength,
                    epochs
                })
            );
            
            // 3. Create batch transaction
            this.logger.debug('Step 4: Creating batch transaction...');
            const batchTx = await this.retryOperation(
                async () => {
                    const coverRegisterTx = await this.walrusClient.registerBlobTransaction({
                        owner: userAddress,
                        blobId: coverBlobId,
                        rootHash: coverRootHash,
                        size: coverUnencodedLength,
                        deletable: false,
                        epochs: epochs,
                    });
                    
                    coverRegisterTx.setSender(userAddress);
                    return coverRegisterTx;
                },
                2,
                'Transaction creation',
                (error) => new TransactionBuildException(`Failed to create batch transaction: ${error.message}`, {
                    userAddress,
                    coverBlobId,
                    contentBlobId,
                    operation: 'registerBlobTransaction'
                })
            );
            
            if (title) {
                this.logger.debug(`✅ Batch transaction created for: "${title}"`);
            }
            
            // 4. Estimate gas costs via dry run
            this.logger.debug('Step 5: Estimating gas costs...');
            const { dryRunResult, totalGasWithBuffer } = await this.retryOperation(
                async () => {
                    const serializedBatchTx = await batchTx.build({ client: this.suiClient as any });
                    
                    const dryRunResult = await this.suiClient.dryRunTransactionBlock({
                        transactionBlock: serializedBatchTx,
                    });
                    
                    if (dryRunResult.effects.status.status !== 'success') {
                        throw new Error(`Dry run failed: ${dryRunResult.effects.status.error}`);
                    }
                    
                    const totalGasRequired = BigInt(dryRunResult.effects.gasUsed.computationCost) + 
                                           BigInt(dryRunResult.effects.gasUsed.storageCost);
                    const gasBuffer = totalGasRequired / 10n; // 10% buffer
                    const totalGasWithBuffer = totalGasRequired + gasBuffer;
                    
                    return { dryRunResult, totalGasWithBuffer };
                },
                2,
                'Gas estimation',
                (error) => new DryRunException(`Failed to estimate gas costs: ${error.message}`, {
                    userAddress,
                    operation: 'dryRunTransactionBlock'
                })
            );
            
            // Set gas budget
            batchTx.setGasBudget(Number(totalGasWithBuffer));
            
            // 5. Calculate final costs in tokens
            const coverWalTokens = Number(coverStorageCosts.totalCost) / Number(MIST_PER_SUI);
            const contentWalTokens = Number(contentStorageCosts.totalCost) / Number(MIST_PER_SUI);
            const gasSuiTokens = Number(totalGasWithBuffer) / Number(MIST_PER_SUI);
            
            const totalWalTokens = coverWalTokens + contentWalTokens;
            const totalSuiTokens = gasSuiTokens;
            
            this.logger.log(`✅ Batch costs calculated: Cover: ${coverWalTokens.toFixed(6)} WAL, Content: ${contentWalTokens.toFixed(6)} WAL, Gas: ${gasSuiTokens.toFixed(6)} SUI`);
            
            // 6. Serialize final transaction
            const transactionBytes = await this.retryOperation(
                async () => {
                    const finalSerializedTx = await batchTx.build({ client: this.suiClient as any });
                    return Buffer.from(finalSerializedTx).toString('base64');
                },
                2,
                'Transaction serialization',
                (error) => new TransactionBuildException(`Failed to serialize transaction: ${error.message}`, {
                    operation: 'transaction.build'
                })
            );
            
            const result = {
                costs: {
                    coverBlob: { 
                        wal: coverWalTokens, 
                        mist: coverStorageCosts.totalCost.toString() 
                    },
                    contentBlob: { 
                        wal: contentWalTokens, 
                        mist: contentStorageCosts.totalCost.toString() 
                    },
                    totalGas: { 
                        sui: gasSuiTokens, 
                        mist: totalGasWithBuffer.toString() 
                    },
                    total: {
                        walTokens: totalWalTokens,
                        suiTokens: totalSuiTokens,
                        walMist: (BigInt(coverStorageCosts.totalCost) + BigInt(contentStorageCosts.totalCost)).toString(),
                        suiMist: totalGasWithBuffer.toString()
                    }
                },
                transaction: transactionBytes,
                metadata: {
                    coverBlobId,
                    contentBlobId,
                    estimatedTime: this.estimateTransactionTime(totalWalTokens, totalSuiTokens)
                }
            };
            
            this.logger.log(`✅ Batch upload preparation completed for ${operation}`);
            return result;
            
        } catch (error) {
            // Enhanced error logging and re-throwing
            if (error instanceof WalrusException) {
                this.logger.error(`❌ Batch upload preparation failed for ${operation}:`, {
                    type: error.name,
                    message: error.message,
                    context: error.context,
                    status: error.getStatus()
                });
                throw error;
            }
            
            this.logger.error(`❌ Unexpected error in batch upload preparation for ${operation}:`, {
                error: error.message,
                stack: error.stack,
                type: error.constructor.name
            });
            
            throw new WalrusException(`Failed to prepare batch upload: ${error.message}`, undefined, {
                operation: 'prepareBatchUpload',
                title,
                originalError: error.message
            });
        }
    }

    /**
     * Retry operation with exponential backoff
     */
    private async retryOperation<T>(
        operation: () => Promise<T>,
        maxRetries: number,
        operationName: string,
        errorFactory: (error: Error) => WalrusException
    ): Promise<T> {
        let lastError: Error;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await operation();
                if (attempt > 1) {
                    this.logger.log(`✅ ${operationName} succeeded on attempt ${attempt}`);
                }
                return result;
            } catch (error) {
                lastError = error as Error;
                this.logger.warn(`⚠️ ${operationName} failed on attempt ${attempt}/${maxRetries}: ${error.message}`);
                
                if (attempt < maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5s delay
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw errorFactory(lastError!);
    }

    /**
     * Estimate transaction completion time based on costs
     */
    private estimateTransactionTime(walTokens: number, suiTokens: number): string {
        // Base time estimation logic
        const baseTime = 30; // seconds
        const walComplexity = Math.min(walTokens * 10, 30); // Max 30s for WAL operations
        const suiComplexity = Math.min(suiTokens * 5, 15); // Max 15s for SUI operations
        
        const estimatedSeconds = baseTime + walComplexity + suiComplexity;
        
        if (estimatedSeconds < 60) {
            return `~${Math.round(estimatedSeconds)} seconds`;
        } else {
            const minutes = Math.round(estimatedSeconds / 60);
            return `~${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
    }
}
