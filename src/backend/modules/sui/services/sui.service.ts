import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFundedKeypair } from '../../../funded-keypair';
import { Transaction } from '@mysten/sui/transactions';
// WalrusClient import seems unused in this specific context, can be kept or removed if not used elsewhere.
// import { WalrusClient } from '@mysten/walrus'; 

export class SuiService {
    public readonly suiClient: SuiClient;
    // Placeholder for platform wallet address - ideally from .env
    private readonly platformWalletAddress: string = process.env.PLATFORM_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000000000000000000000000000'; // TODO: Replace with actual env var

    constructor() {
        this.suiClient = new SuiClient({
            url: getFullnodeUrl('testnet'),
        });
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
                console.warn('PLATFORM_WALLET_ADDRESS is not set or is a placeholder, using default 0x0...');
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

            console.log('Tale template published. Digest:', result.digest);
            
            // Extract the Tale object ID from the transaction effects
            let taleObjectId = null;
            if (result.effects?.created) {
                for (const createdObj of result.effects.created) {
                    if (result.objectChanges) {
                        for (const change of result.objectChanges) {
                            if (change.type === 'created' && change.objectType.endsWith('::publication::Tale')) {
                                taleObjectId = change.objectId;
                                console.log('Created Tale Object ID from objectChanges:', taleObjectId);
                                break;
                            }
                        }
                    }
                    if (taleObjectId) break;
                }
            }
            if (!taleObjectId && result.effects?.created && result.effects.created.length > 0) {
                 console.warn(
                    'Could not reliably determine created Tale object ID directly from transaction effects. ' +
                    'Consider inspecting the full transaction response or relying on objectChanges if enabled.'
                 );
            }
            // For now, returning digest. Consider returning taleObjectId or an object with both.
            return result.digest; 
        } catch (error) {
            let message = 'Unknown Error';
            if (error instanceof Error) message = error.message;
            console.error('Publish Tale Template failed:', message, error);
            throw error;
        }
    }
}