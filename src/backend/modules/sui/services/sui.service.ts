import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFundedKeypair } from '../../../funded-keypair';
import { Transaction } from '@mysten/sui/transactions';
import { WalrusClient } from '@mysten/walrus';

export class SuiService {
    public readonly suiClient: SuiClient;

    constructor() {
        this.suiClient = new SuiClient({
            url: getFullnodeUrl('testnet'),
        });
    }
    
    async publishTale(
        blobId: string,
        title: string,
    ): Promise<string> {
        try {
            const contractAddress = process.env.CONTRACT_ADDRESS_TESTNET;
            if (!contractAddress) {
                throw new Error('CONTRACT_ADDRESS_TESTNET not set in .env');
            }

            const keypair = await getFundedKeypair();
            const tx = new Transaction();

            tx.moveCall({
                package: process.env.CONTRACT_ADDRESS_TESTNET as string,
                module: 'publication',
                function: 'publish',
                arguments: [tx.pure.string(blobId), tx.pure.string(title)],
            });

            const result = await this.suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: { showEffects: true },
            });

            console.log('Tale published:', result.digest);
            return result.digest;
        } catch (error) {
            let message = 'Unknown Error';
            if (error instanceof Error) message = error.message;
            console.error('Publish failed:', message);
            throw error;
        }
    }
}