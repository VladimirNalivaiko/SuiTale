import { WalrusClient } from '@mysten/walrus';
import { client as suiClient } from './sui';
import * as fs from 'fs';
import { generateKeyPair } from 'node:crypto';
import { Signer } from '@mysten/sui/cryptography';
import { getFundedKeypair } from './funded-keypair';

const client = new WalrusClient({
    network: 'testnet',
    suiClient,
});

export async function uploadTale(filePath: string): Promise<string> {
    const fileContent = fs.readFileSync(filePath);
    const keyPair = await getFundedKeypair();

    console.log('Uploaded started:');

    const { blobId } = await client.writeBlob({
        signer: keyPair,
        blob: fileContent,
        deletable: false,
        epochs: 3,
    });
    console.log('Blob ID:', blobId);
    console.log('URL:', `https://cache.testnet.walrus.xyz/blob/${blobId}`);
    return blobId;
}

export async function getTale(blobId: string): Promise<Blob> {
    const keyPair = await getFundedKeypair();
    const blobBytes = await client.readBlob({ blobId });
    let blob = new Blob([new Uint8Array(blobBytes)]);
    const textDecoder = new TextDecoder('utf-8');
    const resultString = textDecoder.decode(await blob.arrayBuffer());

    console.log('Blob:', resultString);
    return blob;
}
