import { WalrusClient } from '@mysten/walrus';
import { client as suiClient } from './sui';
import * as fs from 'fs';
import { getFundedKeypair } from './funded-keypair';

const client = new WalrusClient({
    network: 'testnet',
    suiClient,
});

export async function uploadTale(filePath: string): Promise<string> {
    const fileContent = fs.readFileSync(filePath);
    const keyPair = await getFundedKeypair();

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
}

export async function getTale(blobId: string): Promise<string> {
    const blobBytes = await client.readBlob({ blobId });
    const textDecoder = new TextDecoder('utf-8');
    const resultString = textDecoder.decode(blobBytes);

    console.log('Blob content:', resultString);
    return resultString;
}
