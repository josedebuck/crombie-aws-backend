import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';

describe('CloudinaryController', () => {
  let controller: CloudinaryController;
  let service: CloudinaryService;

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudinaryController],
      providers: [
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    controller = module.get<CloudinaryController>(CloudinaryController);
    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should call cloudinaryService.uploadImage and return result', async () => {
      const file = { originalname: 'test.jpg', buffer: Buffer.from('') } as Express.Multer.File;
      const result = { url: 'http://example.com/test.jpg' };

      mockCloudinaryService.uploadImage.mockResolvedValue(result);

      const response = await controller.uploadImage(file);

      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(file);
      expect(response).toEqual(result);
    });
  });

  describe('deleteImage', () => {
    it('should call cloudinaryService.deleteImage and return result', async () => {
      const publicId = 'test_id';
      const result = { message: 'deleted' };

      mockCloudinaryService.deleteImage.mockResolvedValue(result);

      const response = await controller.deleteImage(publicId);

      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith(publicId);
      expect(response).toEqual(result);
    });
  });
});