import { uploadTale } from "./walrus";
import * as path from "path";
export { TESTNET_WALRUS_PACKAGE_CONFIG, MAINNET_WALRUS_PACKAGE_CONFIG } from './constants';

async function main() {
    const filePath = path.resolve(__dirname, "../../data/tale.md");
    const blobId = await uploadTale(filePath);
    console.log("Uploaded with Blob ID:", blobId);
}

main().catch(console.error);