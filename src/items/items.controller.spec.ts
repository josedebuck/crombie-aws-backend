import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../cognito-auth/cognito-auth.guard';
import { RolesGuard } from '../custom-decorators/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ItemsService;

  const mockItemsService = {
    addToCart: jest.fn().mockResolvedValue({ message: 'Added to cart' }),
    getCart: jest.fn().mockResolvedValue([{ id: 1, name: 'item1' }]),
    removeCartItem: jest.fn().mockResolvedValue({ message: 'Item removed from cart' }),
    addToWishlist: jest.fn().mockResolvedValue({ message: 'Added to wishlist' }),
    getWishlist: jest.fn().mockResolvedValue([{ id: 2, name: 'item2' }]),
    removeFromWishlist: jest.fn().mockResolvedValue({ message: 'Item removed from wishlist' }),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1 };
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate: () => true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [{ provide: ItemsService, useValue: mockItemsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addToCart', () => {
    it('should call addToCart method and return expected result', async () => {
      const result = await controller.addToCart(
        { user: { id: 1 } } as any,
        { productId: '1' },
      );
      expect(service.addToCart).toHaveBeenCalledWith(1, '1', undefined);
      expect(result).toEqual({ message: 'Added to cart' });
    });

    it('should call addToCart with quantity when provided', async () => {
      const result = await controller.addToCart(
        { user: { id: 1 } } as any,
        { productId: '1', quantity: 2 },
      );
      expect(service.addToCart).toHaveBeenCalledWith(1, '1', 2);
      expect(result).toEqual({ message: 'Added to cart' });
    });
  });

  describe('getCart', () => {
    it('should call getCart and return expected cart items', async () => {
      const result = await controller.getCart({ user: { id: 1 } } as any);
      expect(service.getCart).toHaveBeenCalledWith(1);
      expect(result).toEqual([{ id: 1, name: 'item1' }]);
    });
  });

  describe('removeCartItem', () => {
    it('should call removeCartItem and return expected result', async () => {
      const result = await controller.removeCartItem(999, '1'); 
      expect(service.removeCartItem).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'Item removed from cart' });
    });
  });

  describe('addToWishlist', () => {
    it('should call addToWishlist and return expected result', async () => {
      const result = await controller.addToWishlist(
        { user: { id: 1 } } as any,
        { productId: '2' },
      );
      expect(service.addToWishlist).toHaveBeenCalledWith(1, '2');
      expect(result).toEqual({ message: 'Added to wishlist' });
    });
  });

  describe('getWishlist', () => {
    it('should call getWishlist and return expected wishlist items', async () => {
      const result = await controller.getWishlist({ user: { id: 1 } } as any);
      expect(service.getWishlist).toHaveBeenCalledWith(1);
      expect(result).toEqual([{ id: 2, name: 'item2' }]);
    });
  });

  describe('removeFromWishlist', () => {
    it('should call removeFromWishlist and return expected result', async () => {
      const result = await controller.removeFromWishlist(888, '2');
      expect(service.removeFromWishlist).toHaveBeenCalledWith('2');
      expect(result).toEqual({ message: 'Item removed from wishlist' });
    });
  });
});
