import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    MaxLength,
    Matches,
} from 'class-validator';

export class BatchPublicationRequestDto {
    @ApiProperty({
        description: 'Title of the tale',
        example: 'My Blockchain Adventure',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @ApiProperty({
        description: 'Short description of the tale',
        example: 'An exciting journey through the blockchain...',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10000)
    description: string;

    @ApiProperty({ 
        description: 'HTML content of the tale' 
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        description: 'Array of tags associated with the tale',
        type: [String],
        example: ['Blockchain', 'Sui'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiProperty({
        description: 'Word count of the tale content',
        example: 1500,
    })
    @IsOptional()
    wordCount?: number;

    @ApiProperty({
        description: 'Estimated reading time in minutes',
        example: 5,
    })
    @IsOptional()
    readingTime?: number;

    @ApiProperty({ 
        description: "User's Sui wallet address who is publishing" 
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^0x[a-fA-F0-9]{64}$/)
    userAddress: string;
}

export class BatchPublicationResponseDto {
    @ApiProperty({
        description: 'Breakdown of costs for batch upload',
        example: {
            coverBlob: { wal: 0.02, mist: '20000000' },
            contentBlob: { wal: 0.03, mist: '30000000' },
            totalGas: { sui: 0.1, mist: '100000000' },
            total: {
                walTokens: 0.05,
                suiTokens: 0.1,
                walMist: '50000000',
                suiMist: '100000000'
            }
        }
    })
    costs: {
        coverBlob: { wal: number; mist: string };
        contentBlob: { wal: number; mist: string };
        totalGas: { sui: number; mist: string };
        total: {
            walTokens: number;
            suiTokens: number;
            walMist: string;
            suiMist: string;
        };
    };

    @ApiProperty({
        description: 'Serialized batch transaction for user to sign',
        example: 'base64-encoded-transaction-bytes'
    })
    transaction: string;

    @ApiProperty({
        description: 'Metadata about the upload',
        example: {
            coverBlobId: 'blob-id-1',
            contentBlobId: 'blob-id-2', 
            estimatedTime: '~30-60 seconds'
        }
    })
    metadata: {
        coverBlobId: string;
        contentBlobId: string;
        estimatedTime: string;
    };
}

export class RecordBatchPublicationDto {
    @ApiProperty({
        description: 'Sui transaction digest returned after successful execution',
        example: '0x1234567890abcdef...'
    })
    @IsString()
    @IsNotEmpty()
    suiTransactionDigest: string;

    @ApiProperty({
        description: 'Cover blob ID that was registered',
        example: 'blob-cover-id'
    })
    @IsString()
    @IsNotEmpty()
    coverBlobId: string;

    @ApiProperty({
        description: 'Content blob ID that was registered',
        example: 'blob-content-id'
    })
    @IsString()
    @IsNotEmpty()
    contentBlobId: string;

    @ApiProperty({
        description: 'Title of the tale',
        example: 'My Blockchain Adventure',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @ApiProperty({
        description: 'Short description of the tale',
        example: 'An exciting journey through the blockchain...',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10000)
    description: string;

    @ApiProperty({
        description: 'Array of tags associated with the tale',
        type: [String],
        example: ['Blockchain', 'Sui'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiProperty({
        description: 'Word count of the tale content',
        example: 1500,
    })
    @IsOptional()
    wordCount?: number;

    @ApiProperty({
        description: 'Estimated reading time in minutes',
        example: 5,
    })
    @IsOptional()
    readingTime?: number;

    @ApiProperty({ 
        description: "User's Sui wallet address who published" 
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^0x[a-fA-F0-9]{64}$/)
    userAddress: string;
} 