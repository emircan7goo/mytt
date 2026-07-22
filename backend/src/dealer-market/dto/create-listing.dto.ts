import {
  IsString, IsOptional, IsNumber, IsBoolean,
  IsEnum, IsArray, Min, Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DealerListingTypeDto {
  AUCTION = 'AUCTION',
  DIRECT  = 'DIRECT',
}

export class CreateListingDto {
  @ApiProperty() @IsString() brand: string;
  @ApiProperty() @IsString() model: string;
  @ApiPropertyOptional() @IsOptional() @IsString() storage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() color?: string;
  @ApiProperty() @IsString() grade: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) batteryHealth?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasBox?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasInvoice?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasAccessories?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) images: string[];
  @ApiProperty({ enum: DealerListingTypeDto }) @IsEnum(DealerListingTypeDto) listingType: DealerListingTypeDto;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) floorPrice: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) directPrice?: number;
  /** Süre (saat): 0.5 = 30dk, 1 = 1sa, 6 = 6sa — sadece AUCTION tipinde kullanılır */
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0.5) @Max(72) durationHours?: number;
}
