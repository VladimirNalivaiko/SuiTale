import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    IsNumber,
    Min,
} from 'class-validator';

export class InitiatePublicationDto {
    @ApiProperty({
        description: 'Title of the tale',
        example: 'My Blockchain Adventure',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Short description of the tale',
        example: 'An exciting journey...',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'HTML content of the tale' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        description: 'Base64 encoded cover image or URL',
        required: false,
    })
    @IsString()
    @IsOptional()
    coverImage?: string;

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
    @IsNumber()
    @Min(1)
    wordCount: number;

    @ApiProperty({
        description: 'Estimated reading time in minutes',
        example: 5,
    })
    @IsNumber()
    @Min(1)
    readingTime: number;

    @ApiProperty({ description: "User's Sui wallet address who is publishing" })
    @IsString()
    @IsNotEmpty()
    userAddress: string;

    @ApiProperty({
        description: 'Base64 encoded signature of the signedMessageBytes by the userAddress',
    })
    @IsString()
    @IsNotEmpty()
    signature_base64: string;

    @ApiProperty({
        description: 'Base64 encoded bytes of the message that was actually signed by the user (includes Sui prefix)',
    })
    @IsString()
    @IsNotEmpty()
    signedMessageBytes_base64: string;

    @ApiProperty({
        description: "Base64 encoded user's public key",
    })
    @IsString()
    @IsNotEmpty()
    publicKey_base64: string;

    @ApiProperty({
        description: 'Signature scheme used by the wallet (e.g., ed25519, secp256k1)',
        example: 'ed25519',
    })
    @IsString()
    @IsNotEmpty()
    signatureScheme: string;
}
