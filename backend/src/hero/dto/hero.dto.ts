import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsUrl, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHeroSlideDto {
  @ApiPropertyOptional({ description: 'Slide background image URL (optional)' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Main headline title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Subtitle / description text' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  btnLeftText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  btnLeftLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  btnRightText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  btnRightLink?: string;

  @ApiPropertyOptional({ description: 'Text color (hex format)', example: '#ffffff' })
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiPropertyOptional({ description: 'Text alignment', enum: ['left', 'center', 'right'], default: 'left' })
  @IsOptional()
  @IsEnum(['left', 'center', 'right'])
  textAlignment?: 'left' | 'center' | 'right';

  @ApiPropertyOptional({ description: 'Background overlay opacity (0-100)', example: 40 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  overlayOpacity?: number;

  @ApiPropertyOptional({ description: 'Slide animation type', enum: ['fade', 'slide', 'zoom'], default: 'fade' })
  @IsOptional()
  @IsEnum(['fade', 'slide', 'zoom'])
  animationType?: 'fade' | 'slide' | 'zoom';

  @ApiPropertyOptional({ description: 'Button style', enum: ['solid', 'outline'], default: 'solid' })
  @IsOptional()
  @IsEnum(['solid', 'outline'])
  buttonStyle?: 'solid' | 'outline';

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHeroSlideDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  btnLeftText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  btnLeftLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  btnRightText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  btnRightLink?: string;

  @ApiPropertyOptional({ description: 'Text color (hex format)', example: '#ffffff' })
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiPropertyOptional({ description: 'Text alignment', enum: ['left', 'center', 'right'] })
  @IsOptional()
  @IsEnum(['left', 'center', 'right'])
  textAlignment?: 'left' | 'center' | 'right';

  @ApiPropertyOptional({ description: 'Background overlay opacity (0-100)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  overlayOpacity?: number;

  @ApiPropertyOptional({ description: 'Slide animation type', enum: ['fade', 'slide', 'zoom'] })
  @IsOptional()
  @IsEnum(['fade', 'slide', 'zoom'])
  animationType?: 'fade' | 'slide' | 'zoom';

  @ApiPropertyOptional({ description: 'Button style', enum: ['solid', 'outline'] })
  @IsOptional()
  @IsEnum(['solid', 'outline'])
  buttonStyle?: 'solid' | 'outline';

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
