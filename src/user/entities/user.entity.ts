import { ApiProperty } from '@nestjs/swagger';
import { CartItem } from '../../items/entities/cart-item.entity';
import { WishlistItem } from '../../items/entities/wishlist-item.entity';

export class User {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() userName: string;
  @ApiProperty({ enum: ['ADMIN', 'USER'] }) rol: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  
  // relaciones para mostrar en swagger
  @ApiProperty({ type: () => [CartItem], required: false })
  cartItems?: CartItem[];
  
  @ApiProperty({ type: () => [WishlistItem], required: false })
  wishlistItems?: WishlistItem[];
}