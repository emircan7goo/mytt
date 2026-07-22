import {
  IsString, IsOptional, IsBoolean, IsInt, IsArray, Min, Max, IsNotEmpty, IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestType } from '@prisma/client';

export class CreateSellRequestDto {
  @ApiProperty({ example: 'Apple' })
  @IsString() @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'iPhone 14 Pro' })
  @IsString() @IsNotEmpty()
  model: string;

  @ApiPropertyOptional({ example: '256GB' })
  @IsOptional() @IsString()
  storage?: string;

  @ApiPropertyOptional({ example: 'Uzay Siyahı' })
  @IsOptional() @IsString()
  color?: string;

  @ApiProperty({ example: 'A', description: 'Kozmetik durum: A+, A, B, C' })
  @IsString() @IsNotEmpty()
  grade: string;

  @ApiPropertyOptional({ example: 87, description: 'Pil sağlığı yüzdesi (0-100)' })
  @IsOptional() @IsInt() @Min(0) @Max(100)
  batteryHealth?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  hasBox?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional() @IsBoolean()
  hasInvoice?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  hasAccessories?: boolean;

  @ApiPropertyOptional({ example: 'Ufak çizik var sol köşede, ekran mükemmel.' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'Yüklenen fotoğraf URL listesi' })
  @IsOptional() @IsArray() @IsString({ each: true })
  imagesUrl?: string[];

  @ApiPropertyOptional({ enum: RequestType, default: RequestType.SELL, description: 'SELL (satış) veya TRADE_IN (takas)' })
  @IsOptional() @IsEnum(RequestType)
  requestType?: RequestType;
}
