import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFundedKeypair } from '../../../funded-keypair';
import { Transaction } from '@mysten/sui/transactions';
import { Logger } from '@nestjs/common';
// WalrusClient import seems unused in this specific context, can be kept or removed if not used elsewhere.
// import { WalrusClient } from '@mysten/walrus'; 

export class SuiService {
    private readonly logger = new Logger(SuiService.name);
    public readonly suiClient: SuiClient;
    // Platform wallet address from environment variables
    private readonly platformWalletAddress: string = process.env.PLATFORM_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000000000000000000000000000';

    constructor() {
        this.suiClient = new SuiClient({
            url: getFullnodeUrl('testnet'),
        });
    }
    
    buildPublishTaleTemplateTransactionBlock(
        blobId: string,
        title: string,
        description: string,
        coverImageUrl: string,
        mintPrice: string, // Pass as string, convert to u64 in moveCall
        mintCapacity: string, // Pass as string, convert to u64 in moveCall
        authorMintBeneficiary: string, // address
        royaltyFeeBps: number, // u16
    ): string { // Returns serialized Transaction as base64 string
        const packageId = process.env.CONTRACT_ADDRESS_TESTNET;
        if (!packageId) {
            throw new Error('CONTRACT_ADDRESS_TESTNET not set in .env');
        }
        if (!this.platformWalletAddress || this.platformWalletAddress === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            this.logger.warn('PLATFORM_WALLET_ADDRESS is not set or is a placeholder, using default 0x0...');
        }

        const txb = new Transaction();

        txb.moveCall({
            package: packageId,
            module: 'publication',
            function: 'publish_tale_template',
            arguments: [
                txb.pure.string(blobId),
                txb.pure.string(title),
                txb.pure.string(description),
                txb.pure.string(coverImageUrl),
                txb.pure.u64(mintPrice),
                txb.pure.u64(mintCapacity),
                txb.pure.address(authorMintBeneficiary),
                txb.pure.u16(royaltyFeeBps),
                txb.pure.address(this.platformWalletAddress)
            ],
        });
        
        return txb.serialize();
    }
    
    async publishTaleTemplate(
        blobId: string,
        title: string,
        description: string,
        coverImageUrl: string,
        mintPrice: string, // Pass as string, convert to u64 in moveCall
        mintCapacity: string, // Pass as string, convert to u64 in moveCall
        authorMintBeneficiary: string, // address
        royaltyFeeBps: number, // u16
    ): Promise<string> { // Returns transaction digest
        try {
            const packageId = process.env.CONTRACT_ADDRESS_TESTNET;
            if (!packageId) {
                throw new Error('CONTRACT_ADDRESS_TESTNET not set in .env');
            }
            if (!this.platformWalletAddress || this.platformWalletAddress === '0x0000000000000000000000000000000000000000000000000000000000000000') {
                this.logger.warn('PLATFORM_WALLET_ADDRESS is not set or is a placeholder, using default 0x0...');
                // Depending on requirements, you might throw an error here instead of warning
            }

            const keypair = await getFundedKeypair();
            const tx = new Transaction();

            tx.moveCall({
                package: packageId,
                module: 'publication',
                function: 'publish_tale_template',
                arguments: [
                    tx.pure.string(blobId),
                    tx.pure.string(title),
                    tx.pure.string(description),
                    tx.pure.string(coverImageUrl),
                    tx.pure.u64(mintPrice), 
                    tx.pure.u64(mintCapacity),
                    tx.pure.address(authorMintBeneficiary),
                    tx.pure.u16(royaltyFeeBps),
                    tx.pure.address(this.platformWalletAddress) // Added platform_wallet_address
                ],
            });

            const result = await this.suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: { showEffects: true, showObjectChanges: true }, // Added showObjectChanges to get created Tale object ID
            });

            this.logger.log('Tale template published. Digest:', result.digest);
            
            // Extract the Tale object ID from the transaction effects
            let taleObjectId = null;
            if (result.effects?.created) {
                for (const createdObj of result.effects.created) {
                    if (result.objectChanges) {
                        for (const change of result.objectChanges) {
                            if (change.type === 'created' && change.objectType.endsWith('::publication::Tale')) {
                                taleObjectId = change.objectId;
                                this.logger.log('Created Tale Object ID from objectChanges:', taleObjectId);
                                break;
                            }
                        }
                    }
                    if (taleObjectId) break;
                }
            }
            if (!taleObjectId && result.effects?.created && result.effects.created.length > 0) {
                 this.logger.warn(
                    'Could not reliably determine created Tale object ID directly from transaction effects. ' +
                    'Consider inspecting the full transaction response or relying on objectChanges if enabled.'
                 );
            }
            // For now, returning digest. Consider returning taleObjectId or an object with both.
            return result.digest; 
        } catch (error) {
            let message = 'Unknown Error';
            if (error instanceof Error) message = error.message;
            this.logger.error('Publish Tale Template failed:', message, error);
            throw error;
        }
    }

    /**
     * Publish Tale using separate blob IDs for content and cover image (client-side Walrus upload)
     */
    async publishTaleWithBlobs(
        contentBlobId: string,
        coverBlobId: string,
        title: string,
        description: string,
        mintPrice: string,
        mintCapacity: string,
        royaltyFeeBps: number = 500, // 5% default
        authorAddress: string
    ): Promise<string> { // Returns transaction digest
        try {
            const packageId = process.env.CONTRACT_ADDRESS_TESTNET;
            if (!packageId) {
                throw new Error('CONTRACT_ADDRESS_TESTNET not set in .env');
            }

            const keypair = await getFundedKeypair();
            const tx = new Transaction();

            // Convert string blob IDs to vector<u8> for Move
            const contentBlobIdBytes = Array.from(new TextEncoder().encode(contentBlobId));
            const coverBlobIdBytes = Array.from(new TextEncoder().encode(coverBlobId));
            const titleBytes = Array.from(new TextEncoder().encode(title));
            const descriptionBytes = Array.from(new TextEncoder().encode(description));

            tx.moveCall({
                package: packageId,
                module: 'publication',
                function: 'publish_tale_with_blobs',
                arguments: [
                    tx.pure.vector('u8', contentBlobIdBytes),  // content_blob_id
                    tx.pure.vector('u8', coverBlobIdBytes),    // cover_blob_id
                    tx.pure.vector('u8', titleBytes),          // title
                    tx.pure.vector('u8', descriptionBytes),    // description
                    tx.pure.u64(mintPrice),                    // mint_price
                    tx.pure.u64(mintCapacity),                 // mint_capacity
                    tx.pure.u16(royaltyFeeBps),                // royalty_fee_bps
                ],
            });

            const result = await this.suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: { showEffects: true, showObjectChanges: true },
            });

            this.logger.log('Tale published with separate blobs. Digest:', result.digest);
            
            // Extract the Tale object ID from the transaction effects
            let taleObjectId = null;
            if (result.objectChanges) {
                for (const change of result.objectChanges) {
                    if (change.type === 'created' && change.objectType.endsWith('::publication::Tale')) {
                        taleObjectId = change.objectId;
                        this.logger.log('Created Tale Object ID:', taleObjectId);
                        break;
                    }
                }
            }
            
            return result.digest;
        } catch (error) {
            let message = 'Unknown Error';
            if (error instanceof Error) message = error.message;
            this.logger.error('Publish Tale with blobs failed:', message, error);
            throw error;
        }
    }

    /**
     * Build transaction for client-side signing (returns serialized transaction)
     */
    buildPublishTaleWithBlobsTransaction(
        contentBlobId: string,
        coverBlobId: string,
        title: string,
        description: string,
        mintPrice: string,
        mintCapacity: string,
        royaltyFeeBps: number = 500,
        userAddress: string
    ): string { // Returns serialized Transaction as base64 string
        try {
            const packageId = process.env.CONTRACT_ADDRESS_TESTNET;
            if (!packageId) {
                throw new Error('CONTRACT_ADDRESS_TESTNET not set in .env');
            }

            const tx = new Transaction();

            // Convert string blob IDs to vector<u8> for Move
            const contentBlobIdBytes = Array.from(new TextEncoder().encode(contentBlobId));
            const coverBlobIdBytes = Array.from(new TextEncoder().encode(coverBlobId));
            const titleBytes = Array.from(new TextEncoder().encode(title));
            const descriptionBytes = Array.from(new TextEncoder().encode(description));

            tx.moveCall({
                package: packageId,
                module: 'publication',
                function: 'publish_tale_with_blobs',
                arguments: [
                    tx.pure.vector('u8', contentBlobIdBytes),  // content_blob_id
                    tx.pure.vector('u8', coverBlobIdBytes),    // cover_blob_id
                    tx.pure.vector('u8', titleBytes),          // title
                    tx.pure.vector('u8', descriptionBytes),    // description
                    tx.pure.u64(mintPrice),                    // mint_price
                    tx.pure.u64(mintCapacity),                 // mint_capacity
                    tx.pure.u16(royaltyFeeBps),                // royalty_fee_bps
                ],
            });

            // Set sender for client-side signing
            tx.setSender(userAddress);
            
            return tx.serialize();
        } catch (error) {
            this.logger.error('Build Tale with blobs transaction failed:', error);
            throw error;
        }
    }

    /**
     * Publish Tale using separate blob IDs and immediately mint first edition NFT (client-side Walrus upload)
     */
    async publishTaleWithBlobsAndMint(
        contentBlobId: string,
        coverBlobId: string,
        title: string,
        description: string,
        mintPrice: string,
        mintCapacity: string,
        royaltyFeeBps: number = 500, // 5% default
        authorAddress: string
    ): Promise<string> { // Returns transaction digest
        try {
            const packageId = process.env.CONTRACT_ADDRESS_TESTNET;
            if (!packageId) {
                throw new Error('CONTRACT_ADDRESS_TESTNET not set in .env');
            }

            const keypair = await getFundedKeypair();
            const tx = new Transaction();

            // Convert string blob IDs to vector<u8> for Move
            const contentBlobIdBytes = Array.from(new TextEncoder().encode(contentBlobId));
            const coverBlobIdBytes = Array.from(new TextEncoder().encode(coverBlobId));
            const titleBytes = Array.from(new TextEncoder().encode(title));
            const descriptionBytes = Array.from(new TextEncoder().encode(description));

            tx.moveCall({
                package: packageId,
                module: 'publication',
                function: 'publish_tale_with_blobs_and_mint',
                arguments: [
                    tx.pure.vector('u8', contentBlobIdBytes),  // content_blob_id
                    tx.pure.vector('u8', coverBlobIdBytes),    // cover_blob_id
                    tx.pure.vector('u8', titleBytes),          // title
                    tx.pure.vector('u8', descriptionBytes),    // description
                    tx.pure.u64(mintPrice),                    // mint_price
                    tx.pure.u64(mintCapacity),                 // mint_capacity
                    tx.pure.u16(royaltyFeeBps),                // royalty_fee_bps
                ],
            });

            const result = await this.suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: { showEffects: true, showObjectChanges: true },
            });

            this.logger.log('Tale published with separate blobs and first NFT minted. Digest:', result.digest);
            
            // Extract both Tale and TaleEditionNFT object IDs from the transaction effects
            let taleObjectId = null;
            let nftObjectId = null;
            
            if (result.objectChanges) {
                for (const change of result.objectChanges) {
                    if (change.type === 'created') {
                        if (change.objectType.endsWith('::publication::Tale')) {
                            taleObjectId = change.objectId;
                            this.logger.log('Created Tale Object ID:', taleObjectId);
                        } else if (change.objectType.endsWith('::publication::TaleEditionNFT')) {
                            nftObjectId = change.objectId;
                            this.logger.log('Created TaleEditionNFT Object ID:', nftObjectId);
                        }
                    }
                }
            }
            
            return result.digest;
        } catch (error) {
            let message = 'Unknown Error';
            if (error instanceof Error) message = error.message;
            this.logger.error('Publish Tale with blobs and mint failed:', message, error);
            throw error;
        }
    }
}