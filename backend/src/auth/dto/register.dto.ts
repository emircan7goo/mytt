import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum RoleEnum {
  CUSTOMER = 'CUSTOMER',
  DEALER = 'DEALER',
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Ahmet Yılmaz', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ enum: RoleEnum, default: RoleEnum.CUSTOMER })
  @IsEnum(RoleEnum)
  @IsOptional()
  role?: RoleEnum;
}
