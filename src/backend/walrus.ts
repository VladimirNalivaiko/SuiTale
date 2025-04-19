import { WalrusClient } from '@mysten/walrus';
import { suiClient } from './sui';
import * as fs from 'fs';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const client = new WalrusClient({
    network: 'testnet',
    suiClient,
});

export async function uploadTale(
    filePath: string,
    keyPair: Ed25519Keypair,
): Promise<string> {
    try {
        const fileContent = fs.readFileSync(filePath);
        console.log('Upload started:');

        const { blobId } = await client.writeBlob({
            signer: keyPair,
            blob: fileContent,
            deletable: false,
            epochs: 3,
        });

        console.log('Blob ID:', blobId);
        console.log('URL:', `https://cache.testnet.walrus.xyz/blob/${blobId}`);
        return blobId;
    } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        console.error('Upload failed:', message);
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
