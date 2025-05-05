import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateTaleDto } from './create-tale.dto';

export class UpdateTaleDto extends PartialType(CreateTaleDto) {
  // All fields are optional in update operations
} 