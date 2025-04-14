import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive } from "class-validator";

export class CreateItemDto { 
  @ApiProperty({ description: 'ID del producto', example: 1 })
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty({ 
    description: 'Cantidad (opcional, default: 1)',
    example: 1, 
    required: false
  })
  @IsNumber()
  @IsPositive()
  quantity?: number = 1;
}