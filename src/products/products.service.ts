import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    let imageUrl = createProductDto.imageUrl;

    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(file);
    }

    try {
      return await this.prisma.product.create({
        data: {
          ...createProductDto,
          stock: createProductDto.stock || 0,
          imageUrl,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          imageUrl: true,
          createdAt: true,
        }
      });
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe un producto con ese nombre');
      }
      if (error.code === 'P2000') {
        throw new BadRequestException('El valor proporcionado para algún campo es demasiado largo');
      }
      throw new BadRequestException(`Error al crear el producto: ${error.message}`);
    }
  }

  async bulkCreate(products: CreateProductDto[]) {
    if (!products || products.length === 0) {
      throw new BadRequestException('La lista de productos no puede estar vacía');
    }

    try {
      return await this.prisma.$transaction(
        products.map(product => 
          this.prisma.product.create({
            data: {
              ...product,
              stock: product.stock || 0,
            },
            select: {
              id: true,
              name: true,
              price: true,
              createdAt: true
            }
          })
        )
      );
    } catch (error) {
      throw new BadRequestException(`Error al crear productos en lote: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        createdAt: true,
      }
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: { 
        cartItems: false,
        wishlistItems: false,
      }
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File) {
    const product = await this.findOne(id);

    let imageUrl = updateProductDto.imageUrl;

    if (file) {
      // Si hay una imagen existente, la eliminamos de Cloudinary
      if (product.imageUrl) {
        const publicId = product.imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }
      imageUrl = await this.cloudinaryService.uploadImage(file);
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        imageUrl,
      },
    });
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    // Si hay una imagen, la eliminamos de Cloudinary
    if (product.imageUrl) {
      const publicId = product.imageUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, name: true, deletedAt: true }
    });
  }

  async updateStock(id: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id, deletedAt: null },
      });

      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }
      if (product.stock < quantity) {
        throw new BadRequestException('Stock insuficiente');
      }

      return tx.product.update({
        where: { id },
        data: { stock: { decrement: quantity } },
      });
    });
  }

  async restore(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}