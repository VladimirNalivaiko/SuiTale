import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFundedKeypair } from './funded-keypair';
import { Transaction } from '@mysten/sui/transactions';
import { WalrusClient } from '@mysten/walrus';

export const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
});

const client = new WalrusClient({
    network: 'testnet',
    suiClient,
});

export async function publishTale(
    blobId: string,
    title: string,
): Promise<string> {
    try {
        const keypair = await getFundedKeypair();
        const tx = new Transaction();

        tx.moveCall({
            package: process.env.CONTRACT_ADDRESS_TESTNET as string,
            module: 'publication',
            function: 'publish',
            arguments: [tx.pure.string(blobId), tx.pure.string(title)],
        });

        const result = await suiClient.signAndExecuteTransaction({
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
