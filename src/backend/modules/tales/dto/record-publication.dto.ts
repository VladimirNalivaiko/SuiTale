import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

// This structure should align with what prepareTalePublication returns in taleDataForRecord
// For now, using a generic object. Consider defining a more specific class/interface if needed.
class TaleDataForRecordDto {
    @ApiProperty({ description: 'Title of the tale', example: 'My Sui Adventure' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Short description of the tale', example: 'An exciting journey...' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Walrus blob ID for the main content', example: 'contentBlobId123' })
    @IsString()
    @IsNotEmpty()
    contentBlobId: string;

    @ApiProperty({ description: 'Walrus blob ID for the cover image', example: 'coverBlobId456' })
    @IsString()
    @IsNotEmpty()
    coverBlobId: string;

    @ApiProperty({ description: 'URL of the cover image (potentially from Walrus)', example: 'http://.../cover.jpg', required: false })
    @IsString()
    @IsOptional()
    coverImageUrl?: string;

    @ApiProperty({ description: 'Backup of the tale content as plain text', example: 'Once upon a time...', required: false })
    @IsString()
    @IsOptional()
    contentBackup?: string;

    @ApiProperty({ description: 'Backup of the cover image as base64 string', example: 'iVBORw0KGgoAAAANSUhEUgAA...', required: false })
    @IsString()
    @IsOptional()
    coverImageBase64?: string;

    @ApiProperty({ description: 'Tags for the tale', example: ['sui', 'nft'], type: [String] })
    tags: string[];

    @ApiProperty({ description: 'Word count', example: 1500 })
    wordCount: number;

    @ApiProperty({ description: 'Reading time in minutes', example: 7 })
    readingTime: number;

    @ApiProperty({ description: 'Author\'s Sui address', example: '0x...' })
    @IsString()
    @IsNotEmpty()
    authorId: string;

    @ApiProperty({ description: 'Mint price for the Tale NFT (in MIST)', example: '100000000' })
    @IsString()
    @IsNotEmpty()
    mintPrice: string;

    @ApiProperty({ description: 'Mint capacity for the Tale NFT', example: '100' })
    @IsString()
    @IsNotEmpty()
    mintCapacity: string;

    @ApiProperty({ description: 'Royalty fee in basis points (e.g., 500 for 5%)', example: 500 })
    royaltyFeeBps: number;
}

export class RecordPublicationDto {
    @ApiProperty({
        description: 'Sui transaction digest from the successful publication transaction',
        example: 'CjkvRLX1Wg1u474A4z1N2y4zV8T8HZZfWZ8tQk3zQ9oG=',
    })
    @IsString()
    @IsNotEmpty()
    txDigest: string;

    @ApiProperty({ 
        description: 'Data about the tale that was prepared before transaction signing',
        type: () => TaleDataForRecordDto 
    })
    @IsObject()
    @IsNotEmpty()
    // @ValidateNested() // Enable if specific validation for TaleDataForRecordDto fields is needed
    // @Type(() => TaleDataForRecordDto) // Enable if specific validation for TaleDataForRecordDto fields is needed
    taleDataForRecord: TaleDataForRecordDto;
} 