import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
})
export class Tale extends Document {
    @ApiProperty({ description: 'The unique identifier of the tale' })
    id: string = '';

    @Prop({ required: true })
    @ApiProperty({
        description: 'Title of the tale',
        example: 'My Blockchain Adventure',
    })
    title: string = '';

    @Prop({ required: true })
    @ApiProperty({
        description: 'Short description of the tale',
        example:
            'An exciting journey into the world of decentralized applications',
    })
    description: string = '';

    @Prop({ required: true })
    @ApiProperty({
        description: 'Walrus network content identifier (BlobId) - for content blob',
        example: 'lr-oIvxVti7-ZSvG-4u81GOsWBmaOqBeeD1PiU8mBA4',
    })
    blobId: string = '';

    @Prop()
    @ApiProperty({
        description: 'Base64 encoded cover image or URL (legacy)',
        required: false,
    })
    coverImageUrl?: string;

    @Prop()
    @ApiProperty({
        description: 'Walrus network cover image identifier (BlobId) - for cover blob',
        required: false,
        example: 'abc123xyz-cover-blob-id-example',
    })
    coverImageBlobId?: string;

    @Prop()
    @ApiProperty({
        description: 'Walrus network content blob identifier (BlobId) - separate from cover',
        required: false,
        example: 'def456uvw-content-blob-id-example',
    })
    contentBlobId?: string;

    @Prop()
    @ApiProperty({
        description: 'Walrus URL for cover image (built from coverImageBlobId)',
        required: false,
        example: 'https://agg.test.walrus.eosusa.io/blob/abc123xyz-cover-blob-id',
    })
    coverImageWalrusUrl?: string;

    @Prop()
    @ApiProperty({
        description: 'Content that is stored in Walrus',
        required: false,
    })
    content?: string;

    @Prop({ type: [String], default: [] })
    @ApiProperty({
        description: 'Array of tags associated with the tale',
        type: [String],
        example: ['Blockchain', 'Tutorial', 'Sui'],
    })
    tags: string[] = [];

    @Prop({ required: true })
    @ApiProperty({
        description: 'Word count of the tale content',
        example: 1500,
    })
    wordCount: number = 0;

    @Prop({ required: true })
    @ApiProperty({
        description: 'Estimated reading time in minutes',
        example: 5,
    })
    readingTime: number = 0;

    @Prop()
    @ApiProperty({
        description: 'Author ID or wallet address',
        required: false,
    })
    authorId?: string;

    @Prop()
    @ApiProperty({
        description: 'Sui transaction digest for the publication event',
        required: false,
    })
    suiTxDigest?: string;

    @Prop()
    @ApiProperty({
        description: 'Sui Object ID of the published Tale NFT',
        required: false,
    })
    suiObjectId?: string;

    @Prop({ type: Date, default: Date.now })
    @ApiProperty({ description: 'Creation date and time' })
    createdAt: Date = new Date();

    @Prop({ type: Date, default: Date.now })
    @ApiProperty({ description: 'Last update date and time' })
    updatedAt: Date = new Date();
}

export const TaleSchema = SchemaFactory.createForClass(Tale);
