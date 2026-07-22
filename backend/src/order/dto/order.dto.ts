import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'product-uuid-here' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 'İstanbul, Kadıköy...', required: false })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiProperty({ example: 'Kapı numarası: 4', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
