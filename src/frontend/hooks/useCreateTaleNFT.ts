import { useMutation } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';
import { SuiService } from '../services/sui.service';

/**
 * Hook for creating Tale NFT with separate blob IDs
 */
export const useCreateTaleNFT = () => {
    return useMutation({
        mutationFn: async ({
            contentBlobId,
            coverBlobId,
            title,
            description,
            mintPrice,
            mintCapacity,
            royaltyFeeBps = 500,
            userAddress,
            signAndExecuteTransaction
        }: {
            contentBlobId: string;
            coverBlobId: string;
            title: string;
            description: string;
            mintPrice: number;
            mintCapacity: number;
            royaltyFeeBps?: number;
            userAddress: string;
            signAndExecuteTransaction: (params: { transaction: Transaction; chain: `${string}:${string}` }) => Promise<{ digest: string; [key: string]: any }>;
        }) => {
            try {
                // Create the NFT transaction
                const nftTransaction = SuiService.createTaleNFTWithBlobs(
                    contentBlobId,
                    coverBlobId,
                    title,
                    description,
                    mintPrice,
                    mintCapacity,
                    royaltyFeeBps
                );

                // Set sender
                nftTransaction.setSender(userAddress);

                // Execute transaction
                const result = await signAndExecuteTransaction({
                    transaction: nftTransaction,
                    chain: 'sui:testnet' // Network configuration - matches Sui testnet
                });

                return {
                    digest: result.digest,
                    contentBlobId,
                    coverBlobId,
                    ...result
                };
            } catch (error: any) {
                // Check for user rejection
                if (error.message.includes('User rejection') || error.message.includes('UserRejectionError')) {
                    throw new Error('NFT creation cancelled by user');
                }
                
                // Check for signature errors
                if (error.message.includes('Invalid user signature') || error.message.includes('Required Signature')) {
                    throw new Error('NFT transaction signing failed. Please try again.');
                }
                
                throw error;
            }
        },
        retry: false, // Don't auto-retry NFT creation
    });
}; 