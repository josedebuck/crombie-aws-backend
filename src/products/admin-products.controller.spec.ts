import { Test, TestingModule } from '@nestjs/testing';
import { AdminProductsController } from './admin-products.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../cognito-auth/cognito-auth.guard';
import { RolesGuard } from '../custom-decorators/roles.guard';
import { ExecutionContext } from '@nestjs/common';
import { Roles } from '@prisma/client';

describe('AdminProductsController', () => {
  let controller: AdminProductsController;
  let service: ProductsService;

  const mockProductsService = {
    bulkCreate: jest.fn().mockResolvedValue({ message: 'Products created successfully' }),
    create: jest.fn().mockResolvedValue({ message: 'Product created successfully' }),
    update: jest.fn().mockResolvedValue({ message: 'Product updated successfully' }),
    remove: jest.fn().mockResolvedValue({ message: 'Product soft deleted' }),
    restore: jest.fn().mockResolvedValue({ message: 'Product restored successfully' }),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, role: Roles.ADMIN };
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate: () => true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<AdminProductsController>(AdminProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('bulkCreate', () => {
    it('should create multiple products and return success message', async () => {
      const products = [
        {
          name: 'Product 1',
          description: 'Description for Product 1',
          price: 100,
          stock: 50,
        },
        {
          name: 'Product 2',
          description: 'Description for Product 2',
          price: 150,
          stock: 30,
        },
      ];
  
      const result = await controller.bulkCreate(products);
      expect(service.bulkCreate).toHaveBeenCalledWith(products);
      expect(result).toEqual({ message: 'Products created successfully' });
    });
  });
  

  describe('create', () => {
    it('should create a product and return success message', async () => {
      const createProductDto = {
        name: 'New Product',
        description: 'Product description',
        price: 100,
        stock: 50,
      };
  
      const result = await controller.create(createProductDto);
      expect(service.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual({ message: 'Product created successfully' });
    });
  });

  describe('update', () => {
    it('should update a product and return success message', async () => {
      const updateProductDto = { name: 'Updated Product' };
      const result = await controller.update('1', updateProductDto);
      expect(service.update).toHaveBeenCalledWith('1', updateProductDto);
      expect(result).toEqual({ message: 'Product updated successfully' });
    });
  });

  describe('remove', () => {
    it('should soft delete a product and return success message', async () => {
      const result = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'Product soft deleted' });
    });
  });

  describe('restore', () => {
    it('should restore a deleted product and return success message', async () => {
      const result = await controller.restore('1');
      expect(service.restore).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'Product restored successfully' });
    });
  });
});
