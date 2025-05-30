import { WalrusClient } from '@mysten/walrus';
import { suiClient } from './sui';
import * as fs from 'fs';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const client = new WalrusClient({
    network: 'testnet' as 'testnet' | 'mainnet',
    suiClient: suiClient as any, // Type assertion to bypass incompatible version issue
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
        console.log('URL:', `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`);
        return blobId;
    } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        console.error('Upload failed:', message);
        throw error;
    }
}

/**
 * Store HTML content directly on Walrus network
 * @param content HTML content as string
 * @returns The blob ID for the stored content
 */
export async function storeContentOnWalrus(content: string): Promise<string> {
    try {
        // Convert string to Uint8Array
        const encoder = new TextEncoder();
        const contentBytes = encoder.encode(content);
        
        // Get keypair for signing (you might want to handle this differently)
        const keyPair = await getKeypairForUpload();
        
        console.log('Uploading content to Walrus...');
        const { blobId } = await client.writeBlob({
            signer: keyPair,
            blob: contentBytes,
            deletable: false,
            epochs: 3, // Adjust as needed
        });

        console.log('Content stored with Blob ID:', blobId);
        console.log('URL:', `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`);
        return blobId;
    } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        console.error('Content storage failed:', message);
        throw error;
    }
}

/**
 * Helper function to get a keypair for upload
 * This is a placeholder - implement according to your auth flow
 */
async function getKeypairForUpload(): Promise<Ed25519Keypair> {
    // This should be replaced with your actual logic to get a keypair
    // Consider loading from env variables, secure storage, or user wallet
    return Ed25519Keypair.generate();
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
