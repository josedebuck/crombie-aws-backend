import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      if (file.path) {
        // Si tenemos un path, usamos upload directo
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'crombie/products',
          resource_type: 'auto',
        });
        return result.secure_url;
      } else {
        // Si tenemos un buffer, usamos upload_stream
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'crombie/products',
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) return reject(error);
              if (!result) return reject(new Error('Upload failed'));
              resolve(result);
            },
          );

          toStream(file.buffer).pipe(uploadStream);
        });
        return result.secure_url;
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Error al subir la imagen a Cloudinary');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) return reject(error);
          resolve();
        });
      });
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw new Error('Error al eliminar la imagen de Cloudinary');
    }
  }
}