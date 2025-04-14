import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ItemsService { 
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId, deletedAt: null },
      });
      
      if (!product) throw new NotFoundException('Producto no encontrado');
      if (!product) throw new NotFoundException('Stock insuficiente');
    
      const existingItem = await tx.cartItem.findFirst({
        where: { userId, productId },
      });

      if (existingItem) {
        return tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: { increment: quantity } },
        });
      }

      return tx.cartItem.create({
        data: { userId, productId, quantity },
        include: { product: true }
      });
    });
  }

  async getCart(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeCartItem(itemId);
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true }
    });
  }

  async removeCartItem(itemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: itemId }
    });
  }

  //parte de la wishlist
  async addToWishlist(userId: string, productId: string) {
    return this.prisma.wishlistItem.create({
      data: { userId, productId },
      include: { product: true }
    });
  }

  async getWishlist(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true}
    });
  }

  async removeFromWishlist(itemId: string) {
    return this.prisma.wishlistItem.delete({
      where: { id: itemId }
    });
  }
}