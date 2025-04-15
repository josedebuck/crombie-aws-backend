import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockCloudinaryService = {
    uploadImage: jest.fn().mockResolvedValue({ url: 'mocked-url' }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        PrismaService,
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new product with image', async () => {
    const name = 'Test Product';
    const description = 'A description of the test product';
    const price = 100;
    const stock = 50;
    const image = { originalname: 'mocked-image.jpg' } as Express.Multer.File;

    const result = await controller.create(name, description, price, stock, image);

    expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(image);
    expect(result).toEqual({ url: 'mocked-url', name });
  });

  it('should update an existing product with new image', async () => {
    const id = '1';
    const updateProductDto = { name: 'Updated Product', description: 'Updated description', price: 150, stock: 40 };
    const file = { originalname: 'mocked-new-image.jpg' } as Express.Multer.File; // Simula un archivo de imagen
  
    const result = await controller.update(id, updateProductDto, file);
  
    expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(file);
    expect(result).toEqual({ url: 'mocked-url', name: 'Updated Product' });
  });
});
