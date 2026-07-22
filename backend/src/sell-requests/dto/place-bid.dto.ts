import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PlaceBidDto {
  @ApiProperty({ example: 12500, description: 'Teklif tutarı (₺)' })
  @Type(() => Number)
  @IsNumber() @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'Hızlı kargo ve nakit ödeme taahhüt ediyorum.' })
  @IsOptional() @IsString()
  note?: string;
}
