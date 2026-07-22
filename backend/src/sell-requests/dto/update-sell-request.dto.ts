import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SellRequestStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateSellRequestDto {
  @ApiPropertyOptional({ enum: SellRequestStatus })
  @IsOptional() @IsEnum(SellRequestStatus)
  status?: SellRequestStatus;

  @ApiPropertyOptional({ example: '12000', description: 'Kabul edilen nihai fiyat' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  finalPrice?: number;

  @ApiPropertyOptional({ description: 'Kazanan bayi kullanıcı ID\'si' })
  @IsOptional() @IsString()
  winningDealerId?: string;

  @ApiPropertyOptional({ description: 'Müşterinin kargo takip kodu' })
  @IsOptional() @IsString()
  shippingCode?: string;

  @ApiPropertyOptional({ description: 'Admin notu' })
  @IsOptional() @IsString()
  adminNote?: string;
}
