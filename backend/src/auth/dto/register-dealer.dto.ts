import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDealerDto {
  @ApiProperty({ example: 'ahmet@firma.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Ahmet Yılmaz' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Yıldız Telekomünikasyon A.Ş.' })
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @Matches(/^[0-9]+$/, { message: 'Vergi numarası sadece rakamlardan oluşmalıdır' })
  taxId!: string;
}
