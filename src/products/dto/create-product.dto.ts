import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsPositive,
  MinLength, 
  MaxLength,
  IsOptional
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty({
    example: 'Smartphone Premium',
    description: 'Product name (3-50 chars)'
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(500)
  @ApiProperty({
    example: 'Latest model with advanced camera features',
    description: 'Detailed product description (20-500 chars)'
  })
  description: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 999.99,
    description: 'Positive number with 2 decimal places'
  })
  price: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    example: 100,
    description: 'Initial stock quantity (default: 0)',
    required: false
  })
  stock: number;

  @ApiProperty({ description: 'URL de la imagen del producto', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}