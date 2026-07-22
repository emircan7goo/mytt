import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'My Awesome Phone Shop' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'We sell the best phones', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: '123 Main St, Tech City', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateStoreDto {
  @ApiProperty({ example: 'My Awesome Phone Shop Updated', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'New bio', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: 'New Address', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}
