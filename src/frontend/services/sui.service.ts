import { Transaction } from '@mysten/sui/transactions';

// Contract address from environment variable
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS_TESTNET;

/**
 * Frontend SuiService for creating Tale NFT transactions
 */
export class SuiService {
    /**
     * Create Tale NFT transaction using separate blob IDs (for client-side Walrus uploads)
     * This creates both the Tale template and immediately mints the first edition NFT for the author
     */
    public static createTaleNFTWithBlobs(
        contentBlobId: string,
        coverBlobId: string,
        title: string,
        description: string,
        mintPrice: number,
        mintCapacity: number,
        royaltyFeeBps: number = 500 // 5% default
    ): Transaction {
        try {
            if (!CONTRACT_ADDRESS) {
                throw new Error('Contract address not found in environment variables');
            }

            const tx = new Transaction();
            
            // Convert string parameters to byte arrays for Move function
            const contentBlobIdBytes = Array.from(new TextEncoder().encode(contentBlobId));
            const coverBlobIdBytes = Array.from(new TextEncoder().encode(coverBlobId));
            const titleBytes = Array.from(new TextEncoder().encode(title));
            const descriptionBytes = Array.from(new TextEncoder().encode(description));
            
            // Convert mint price from SUI to MIST
            const mintPriceInMist = Math.floor(mintPrice * 1_000_000_000);
            
            // Call the new contract function that creates Tale + first NFT
            tx.moveCall({
                package: CONTRACT_ADDRESS,
                module: 'publication',
                function: 'publish_tale_with_blobs_and_mint',
                arguments: [
                    tx.pure.vector('u8', contentBlobIdBytes),  // content_blob_id
                    tx.pure.vector('u8', coverBlobIdBytes),    // cover_blob_id  
                    tx.pure.vector('u8', titleBytes),          // title
                    tx.pure.vector('u8', descriptionBytes),    // description
                    tx.pure.u64(mintPriceInMist),              // mint_price
                    tx.pure.u64(mintCapacity),                 // mint_capacity
                    tx.pure.u16(royaltyFeeBps),                // royalty_fee_bps
                ],
            });
            
            return tx;
        } catch (error) {
            // Error creating transaction - likely configuration issue
            throw new Error(`Failed to create Tale NFT transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get contract address
     */
    public static getContractAddress(): string {
        if (!CONTRACT_ADDRESS) {
            throw new Error('Contract address not found in environment variables');
        }
        return CONTRACT_ADDRESS;
    }
} 