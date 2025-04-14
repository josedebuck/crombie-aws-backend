import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { 
  IsNumber, 
  IsPositive, 
  IsOptional,
  ValidateIf
} from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({
    example: 899.99,
    description: 'New price (if updating)',
    required: false
  })
  price?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({
    example: 50,
    description: 'Stock adjustment (not cumulative)',
    required: false
  })
  stock?: number;
}