import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { AdminProductsController } from "./admin-products.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}