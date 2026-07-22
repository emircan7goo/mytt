import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Condition } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'Apple' })
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ApiProperty({ example: 'iPhone 14 Pro' })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({ enum: Condition, default: Condition.NEW })
  @IsEnum(Condition)
  condition!: Condition;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: ['http://example.com/img1.jpg'], required: false })
  @IsString({ each: true })
  @IsOptional()
  imagesUrl?: string[];
}

export class UpdateCampaignDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isOnCampaign!: boolean;

  @ApiProperty({ example: 38000, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountedPrice?: number;

  @ApiProperty({ example: 'Son Şans', required: false })
  @IsString()
  @IsOptional()
  campaignTag?: string;

  @ApiProperty({ example: '2026-05-01T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  campaignEndDate?: string;
}
