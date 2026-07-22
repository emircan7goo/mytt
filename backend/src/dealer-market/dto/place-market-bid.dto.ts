import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlaceMarketBidDto {
  @ApiProperty({ description: 'Teklif tutarı (₺)' })
  @Type(() => Number) @IsNumber() @Min(0)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  note?: string;
}
