import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, ParseFloatPipe, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../cognito-auth/cognito-auth.guard';
import { RolesGuard } from '../custom-decorators/roles.guard';
import { AcceptedRoles } from '../custom-decorators/roles.decorator';
import { Roles } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Products')
@Controller('products')
export class ProductsController { 
  constructor(private readonly productsService: ProductsService) {}

  //endpoint público
  @Get()
  @ApiOperation({
    summary: 'Listar todos los productos (Público)',
    description: 'Endpoint accesible para cualquier usuario, sin necesidad de autenticación.'
  })
  @ApiResponse({ status: 200, description: 'Lista de productos retornada' })
  async findAll() {
    return this.productsService.findAll();
  }

  //endpoint público
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por un ID (Público)' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  //método exlusivo de ADMIN
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AcceptedRoles(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  @ApiOperation({
    summary: 'Crear un producto (Admin)',
    description: 'Requiere rol ADMIN. Permite subir una imagen del producto.'
  })
  @ApiResponse({ status: 201, description: 'Producto creado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('price', ParseFloatPipe) price: number,
    @Body('stock', ParseIntPipe) stock: number,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const createProductDto: CreateProductDto = {
      name,
      description,
      price,
      stock,
    };
    return this.productsService.create(createProductDto, image);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AcceptedRoles(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Actualizar un producto (Admin)',
    description: 'Requiere rol ADMIN. Permite actualizar la imagen del producto.' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  @ApiResponse({ status: 404, description: 'El producto no existe' })
  async update(
    @Param('id') id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.update(id, updateProductDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AcceptedRoles(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un producto (ADMIN)',
    description: 'Soft delete. Requiere rol ADMIN.'
  })
  @ApiResponse({ status: 200, description: 'Producto marcado como eliminado' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}