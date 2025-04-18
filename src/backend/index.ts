import { getTale, uploadTale } from './walrus';
import { publishTale } from './sui';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    try {
        const filePath = path.resolve(__dirname, '../../data/tale.md');
        const blobId = await uploadTale(filePath);
        console.log('Uploaded with Blob ID:', blobId);

        const blobData = await getTale(blobId);
        console.log('Fetched data:', blobData);

        const title = 'My First Tale';
        const digest = await publishTale(blobId, title);
        console.log('Published on Sui:', digest);
    } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        console.error('Main failed:', message);
        throw error;
    }
}

main().catch((error) => {
    console.error('Fatal error:', error.message || error);
});
