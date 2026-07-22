import {
  IsString, IsOptional, IsBoolean, IsInt,
  IsDecimal, Min, IsArray, ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Global Katalog ───────────────────────────────────────────────────────────

export class CreateGlobalProductDto {
  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiPropertyOptional({ example: '256GB' })
  @IsOptional()
  @IsString()
  storage?: string;

  @ApiPropertyOptional({ example: 'Space Black' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ type: [String], description: 'Master image URLs (max 3)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  masterImages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  specsJson?: Record<string, unknown>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateGlobalProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  masterImages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  specsJson?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ── Bayi Stok Girişi ─────────────────────────────────────────────────────────

export class CreateDealerStockDto {
  @ApiProperty({ description: 'GlobalProduct ID' })
  @IsString()
  globalProductId: string;

  @ApiProperty({ enum: ['A+', 'A', 'B'], description: 'Cosmetic grade' })
  @IsString()
  grade: string;

  @ApiPropertyOptional({ description: 'Battery health percentage (0-100)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  batteryHealth?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasBox?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasInvoice?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasAccessories?: boolean;

  @ApiPropertyOptional({ description: 'Remaining warranty in months' })
  @IsOptional()
  @IsInt()
  @Min(0)
  warrantyMonths?: number;

  @ApiPropertyOptional({ description: 'IMEI (visible to admin only)' })
  @IsOptional()
  @IsString()
  imei?: string;

  @ApiProperty({ example: '24999.99' })
  @IsString()           // Decimal string olarak alınır, servis katmanında parse edilir
  price: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ type: [String], description: 'Bayi cihaz fotoğrafları (min 3 zorunlu)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dealerImages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDealerStockDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  batteryHealth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasBox?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasInvoice?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasAccessories?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  warrantyMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dealerImages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

// ── Stok Talebi ──────────────────────────────────────────────────────────────

export class CreateStockRequestDto {
  @ApiProperty({ description: 'Model adı (serbest metin)' })
  @IsString()
  modelName: string;

  @ApiPropertyOptional({ enum: ['A+', 'A', 'B'] })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({ description: 'Maksimum ödemeye razı olunan fiyat' })
  @IsOptional()
  @IsString()
  maxPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
