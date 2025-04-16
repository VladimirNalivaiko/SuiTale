import { WalrusClient } from '@mysten/walrus';
import { client as suiClient } from './sui';
import * as fs from 'fs';
import { getFundedKeypair } from './funded-keypair';
import { Transaction } from '@mysten/sui/transactions';

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
            arguments: [tx.pure(blobId), tx.pure(title)],
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

export async function getTale(blobId: string): Promise<string> {
    try {
        const blobBytes = await client.readBlob({ blobId });
        const textDecoder = new TextDecoder('utf-8');
        const resultString = textDecoder.decode(blobBytes);

        console.log('Blob content:', resultString);
        return resultString;
    } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        console.error('Fetch failed:', message);
        throw error;
    }
}
