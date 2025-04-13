import { getTale, uploadTale } from './walrus';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const filePath = path.resolve(__dirname, '../../data/tale.md');
    const blobId = await uploadTale(filePath);
    console.log('Uploaded with Blob ID:', blobId);

    const blobData = await getTale(blobId);
    console.log('Fetched data:', blobData);
}

main().catch(console.error);
