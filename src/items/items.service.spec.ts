import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ItemsService', () => {
  let service: ItemsService;
  let prisma: PrismaService;

  // mock de la db
  const mockPrismaService = {
    cartItem: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    wishlistItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    // mock para la función $transaction
    $transaction: jest.fn().mockImplementation((callback) => {
      return callback({
        product: { findUnique: jest.fn() },
        cartItem: { create: jest.fn(), findFirst: jest.fn() },
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateCartItem', () => {
    it('should update quantity if greater than 0', async () => {
      const updatedItem = { id: 'item1', quantity: 3, product: {} };
      mockPrismaService.cartItem.update.mockResolvedValue(updatedItem);

      const result = await service.updateCartItem('item1', 3);
      expect(result).toEqual(updatedItem);
    });

    it('should remove item if quantity <= 0', async () => {
      const removedItem = { id: 'item1' };
      mockPrismaService.cartItem.delete.mockResolvedValue(removedItem);

      const result = await service.updateCartItem('item1', 0);
      expect(result).toEqual(removedItem);
    });
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist', async () => {
      const wishlistItem = { id: 'wish1', product: { id: 'prod1' } };
      mockPrismaService.wishlistItem.create.mockResolvedValue(wishlistItem);

      const result = await service.addToWishlist('user1', 'prod1');
      expect(result).toEqual(wishlistItem);
    });
  });

  describe('getWishlist', () => {
    it('should return wishlist items', async () => {
      const items = [{ id: 'wish1', product: {} }];
      mockPrismaService.wishlistItem.findMany.mockResolvedValue(items);

      const result = await service.getWishlist('user1');
      expect(result).toEqual(items);
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove item from wishlist', async () => {
      const removed = { id: 'wish1' };
      mockPrismaService.wishlistItem.delete.mockResolvedValue(removed);

      const result = await service.removeFromWishlist('wish1');
      expect(result).toEqual(removed);
    });
  });
});
