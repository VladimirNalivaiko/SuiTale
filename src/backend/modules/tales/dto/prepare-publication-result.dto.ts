import { ApiProperty } from '@nestjs/swagger';

// This DTO is for Swagger documentation and type-hinting for the /prepare-publication endpoint response.
// It mirrors the PreparePublicationResult interface from tales.service.ts

// We need a DTO for taleDataForRecord as well if we want to type it in Swagger
// Reusing the structure from RecordPublicationDto.ts or defining a common one
class PreparedTaleDataDto {
    @ApiProperty({ description: 'Title of the tale', example: 'My Sui Adventure' })
    title: string;

    @ApiProperty({ description: 'Short description of the tale', example: 'An exciting journey...' })
    description: string;

    @ApiProperty({ description: 'Walrus blob ID for the main content', example: 'blobId123' })
    blobId: string;

    @ApiProperty({ description: 'URL of the cover image (potentially from Walrus)', example: 'http://.../cover.jpg', required: false })
    coverImageUrl?: string;

    @ApiProperty({ description: 'Tags for the tale', example: ['sui', 'nft'], type: [String] })
    tags: string[];

    @ApiProperty({ description: 'Word count', example: 1500 })
    wordCount: number;

    @ApiProperty({ description: 'Reading time in minutes', example: 7 })
    readingTime: number;

    @ApiProperty({ description: 'Author\'s Sui address', example: '0x...' })
    authorId: string;
    
    @ApiProperty({ description: 'Mint price for the Tale NFT (in MIST)', example: '100000000' })
    mintPrice: string;

    @ApiProperty({ description: 'Mint capacity for the Tale NFT', example: '100' })
    mintCapacity: string;

    @ApiProperty({ description: 'Royalty fee in basis points (e.g., 500 for 5%)', example: 500 })
    royaltyFeeBps: number;
}

export class PreparePublicationResultDto {
    @ApiProperty({
        description: 'Base64 encoded string of the serialized transaction block for the user to sign',
        example: 'AQAAAAY<y_bin_359> ... many bytes ... =='
    })
    transactionBlockBytes: string;

    @ApiProperty({
        description: 'Data about the tale that needs to be sent back to the server after successful transaction for recording',
        type: () => PreparedTaleDataDto
    })
    taleDataForRecord: PreparedTaleDataDto;
} 