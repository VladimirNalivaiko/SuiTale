import { WalrusClient } from "@mysten/walrus";
import { client as suiClient } from "./sui"
import * as fs from "fs";
import {generateKeyPair} from "node:crypto";
import {Signer} from "@mysten/sui/cryptography";

const client = new WalrusClient({
    network: 'testnet',
    suiClient
});

const signer = new Signer({
    client,

})

export async function uploadTale(filePath: string): Promise<string> {
    const fileContent = fs.readFileSync(filePath);
    const blob = await client.writeBlob(
        {
            signer: undefined,
            blob: fileContent,
            signal: undefined,
            deletable: false,
            epochs: 3
        }
    );
    console.log("Blob ID:", blob.id);
    console.log("URL:", `https://cache.testnet.walrus.xyz/blob/${blob.id}`);
    return blob.id;
}

export async function getTale(blobId: string): Promise<Buffer> {
    const blob = await client.downloadBlob(blobId);
    return blob.data;
}