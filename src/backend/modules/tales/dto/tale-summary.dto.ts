import { ApiProperty } from '@nestjs/swagger';

export class TaleSummaryDto {
    @ApiProperty({ description: 'The unique identifier of the tale' })
    id: string;

    @ApiProperty({
        description: 'Title of the tale',
        example: 'My Blockchain Adventure',
    })
    title: string;

    @ApiProperty({
        description: 'Short description of the tale',
        example: 'An exciting journey into the world of decentralized applications',
    })
    description: string;

    @ApiProperty({
        description: 'Walrus network content identifier (BlobId) - for content blob',
        example: 'lr-oIvxVti7-ZSvG-4u81GOsWBmaOqBeeD1PiU8mBA4',
    })
    blobId: string;

    @ApiProperty({
        description: 'Base64 encoded cover image or URL (legacy)',
        required: false,
    })
    coverImageUrl?: string;

    @ApiProperty({
        description: 'Walrus network cover image identifier (BlobId) - for cover blob',
        required: false,
        example: 'abc123xyz-cover-blob-id-example',
    })
    coverImageBlobId?: string;

    @ApiProperty({
        description: 'Walrus URL for cover image (built from coverImageBlobId)',
        required: false,
        example: 'https://agg.test.walrus.eosusa.io/blob/abc123xyz-cover-blob-id',
    })
    coverImageWalrusUrl?: string;

    @ApiProperty({
        description: 'Array of tags associated with the tale',
        type: [String],
        example: ['Blockchain', 'Tutorial', 'Sui'],
    })
    tags: string[];

    @ApiProperty({
        description: 'Word count of the tale content',
        example: 1500,
    })
    wordCount: number;

    @ApiProperty({
        description: 'Estimated reading time in minutes',
        example: 5,
    })
    readingTime: number;

    @ApiProperty({
        description: 'Author ID or wallet address',
        required: false,
    })
    authorId?: string;

    @ApiProperty({
        description: 'Sui transaction digest for the publication event',
        required: false,
    })
    suiTxDigest?: string;

    @ApiProperty({
        description: 'Sui Object ID of the published Tale NFT',
        required: false,
    })
    suiObjectId?: string;

    @ApiProperty({ description: 'Creation date and time' })
    createdAt: string;

    @ApiProperty({ description: 'Last update date and time' })
    updatedAt: string;
} 