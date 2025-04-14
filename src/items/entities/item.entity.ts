import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

export class CartItem {
  @ApiProperty() id: number;
  @ApiProperty({ type: () => Product }) product: Product;
  @ApiProperty() productId: number;
  @ApiProperty({ type: () => User }) user: User;
  @ApiProperty() userId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() createdAt: Date;
}