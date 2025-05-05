import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTaleDto {
  @ApiProperty({ description: 'Title of the tale', example: 'My Blockchain Adventure' })
  @IsString()
  @IsNotEmpty()
  title: string = '';
  
  @ApiProperty({ description: 'Short description of the tale', example: 'An exciting journey into the world of decentralized applications' })
  @IsString()
  @IsNotEmpty()
  description: string = '';
  
  @ApiProperty({ description: 'HTML content of the tale' })
  @IsString()
  @IsNotEmpty()
  content: string = '';
  
  @ApiProperty({ description: 'Base64 encoded cover image or URL', required: false })
  @IsString()
  @IsOptional()
  coverImage?: string;
  
  @ApiProperty({ description: 'Array of tags associated with the tale', type: [String], example: ['Blockchain', 'Tutorial', 'Sui'] })
  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];
  
  @ApiProperty({ description: 'Word count of the tale content', example: 1500 })
  @IsNumber()
  @Min(1)
  wordCount: number = 0;
  
  @ApiProperty({ description: 'Estimated reading time in minutes', example: 5 })
  @IsNumber()
  @Min(1)
  readingTime: number = 0;
  
  @ApiProperty({ description: 'Author ID or wallet address', required: false })
  @IsString()
  @IsOptional()
  authorId?: string;
} 