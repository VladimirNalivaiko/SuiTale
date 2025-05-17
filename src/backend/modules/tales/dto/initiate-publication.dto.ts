import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    IsNumber,
    Min,
    IsBase64,
    Matches,
    MaxLength,
} from 'class-validator';

export class InitiatePublicationDto {
    @ApiProperty({
        description: 'Title of the tale',
        example: 'My Blockchain Adventure',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200) // Max title length for on-chain storage
    title: string;

    @ApiProperty({
        description: 'Short description of the tale',
        example: 'An exciting journey...',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10000) // Max description length for on-chain if stored directly, or for metadata
    description?: string; // Optional description for the tale/NFT

    @ApiProperty({ description: 'HTML content of the tale' })
    @IsString()
    @IsNotEmpty()
    content: string; // Main content for Walrus

    @ApiProperty({
        description: 'Base64 encoded cover image or URL',
        required: false,
    })
    @IsOptional()
    @IsString()
    // Basic URL validation, can be made more strict
    // @Matches(/^(ftp|http|https|ipfs|ipns):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/)
    coverImageWalrusUrl?: string; 

    @ApiProperty({
        description: 'Array of tags associated with the tale',
        type: [String],
        example: ['Blockchain', 'Sui'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional() // Сделаем теги опциональными на случай если фронт может прислать пустой массив или ничего
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

    @ApiProperty({ description: "User's Sui wallet address who is publishing" })
    @IsString()
    @IsNotEmpty()
    @Matches(/^0x[a-fA-F0-9]{64}$/) // Sui address format
    userAddress: string;

    @ApiProperty({
        description: 'Base64 encoded signature of the signedMessageBytes by the userAddress',
    })
    @IsString()
    @IsNotEmpty()
    @IsBase64()
    signature_base64: string; // Full signature from wallet (flag+sig+pk)

    @ApiProperty({
        description: 'Base64 encoded bytes of the message that was actually signed by the user (includes Sui prefix)',
    })
    @IsString()
    @IsNotEmpty()
    @IsBase64()
    signedMessageBytes_base64: string; // SUI-prefixed message bytes that were signed

    @ApiProperty({
        description: "Base64 encoded user's public key",
    })
    @IsString()
    @IsNotEmpty()
    @IsBase64()
    publicKey_base64: string; // User's public key (flag+pk)

    @ApiProperty({
        description: 'Signature scheme used by the wallet (e.g., ed25519, secp256k1)',
        example: 'ed25519',
    })
    @IsString()
    @IsNotEmpty()
    signatureScheme: string; // e.g., 'ed25519' or 'secp256k1'

    // Fields for NFT parameters - to be sent from frontend if configurable
    @IsOptional()
    @IsString() // Should be a string representing u64
    mintPrice?: string; 

    @IsOptional()
    @IsString() // Should be a string representing u64
    mintCapacity?: string;

    @IsOptional()
    // @IsNumber() // Type in contract is u16
    // @Min(0)
    // @Max(10000) // Max 100% in basis points
    royaltyFeeBps?: number; // In basis points, e.g., 500 for 5%
}
