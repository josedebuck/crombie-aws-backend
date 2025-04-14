// src/cloudinary/cloudinary.config.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'TU_CLOUD_NAME',
  api_key: 'TU_API_KEY',
  api_secret: 'TU_API_SECRET',
});

export default cloudinary;
