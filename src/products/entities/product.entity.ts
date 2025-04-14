import { CartItem } from 'src/items/entities/cart-item.entity';
import { WishlistItem } from '../../items/entities/wishlist-item.entity';
import { ApiProperty } from '@nestjs/swagger';

export class Product {
  @ApiProperty({
    example: 1,
    description: 'Auto-incremented ID',
  })
  id: number;

  @ApiProperty({
    example: 'Smartphone Premium',
    description: 'Product name (3-50 characters)',
  })
  name: string;

  @ApiProperty({
    example: 'Latest model with advanced camera features',
    description: 'Detailed product description (20-500 characters)',
  })
  description: string;

  @ApiProperty({
    example: 999.99,
    description: 'Product price (positive number with 2 decimal places)',
  })
  price: number;

  @ApiProperty({
    example: 100,
    description: 'Available stock quantity',
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: 'electronics',
    description: 'Product category',
    required: false,
  })
  category?: string;

  @ApiProperty({
    type: () => CartItem,
    isArray: true,
    description: 'Cart items containing this product',
    required: false,
  })
  cartItems?: CartItem[];

  @ApiProperty({
    type: () => WishlistItem,
    isArray: true,
    description: 'Wishlist items containing this product',
    required: false,
  })
  wishlist?: WishlistItem[];

  @ApiProperty({
    example: '2023-07-20T12:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-07-21T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}