import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary');
jest.mock('buffer-to-stream', () => () => ({
  pipe: jest.fn(),
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const config = {
                CLOUDINARY_CLOUD_NAME: 'fake_name',
                CLOUDINARY_API_KEY: 'fake_key',
                CLOUDINARY_API_SECRET: 'fake_secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload image from path', async () => {
    const mockUpload = jest.fn().mockResolvedValue({ secure_url: 'http://fake-url.com' });
    (cloudinary.uploader.upload as jest.Mock) = mockUpload;

    const file = { path: 'fake/path/to/image.jpg' } as Express.Multer.File;

    const url = await service.uploadImage(file);
    expect(mockUpload).toHaveBeenCalledWith('fake/path/to/image.jpg', {
      folder: 'crombie/products',
      resource_type: 'auto',
    });
    expect(url).toBe('http://fake-url.com');
  });

  it('should throw error when upload fails', async () => {
    const file = { path: 'fake/path.jpg' } as Express.Multer.File;
    (cloudinary.uploader.upload as jest.Mock).mockRejectedValue(new Error('Upload failed'));

    await expect(service.uploadImage(file)).rejects.toThrow('Error al subir la imagen a Cloudinary');
  });

  it('should delete image by publicId', async () => {
    const mockDestroy = jest.fn((publicId, cb) => cb(null, {}));
    (cloudinary.uploader.destroy as jest.Mock) = mockDestroy;

    await expect(service.deleteImage('public_id')).resolves.toBeUndefined();
    expect(mockDestroy).toHaveBeenCalledWith('public_id', expect.any(Function));
  });

  it('should throw error when delete fails', async () => {
    const mockDestroy = jest.fn((publicId, cb) => cb(new Error('Delete failed'), null));
    (cloudinary.uploader.destroy as jest.Mock) = mockDestroy;

    await expect(service.deleteImage('public_id')).rejects.toThrow('Error al eliminar la imagen de Cloudinary');
  });
});