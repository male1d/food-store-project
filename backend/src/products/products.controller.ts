import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Query } from '@nestjs/common';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { BulkCreateProductsDto } from './dto/bulk-create-products.dto';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ПОЛУЧИТЬ ВСЕ ТОВАРЫ С ФИЛЬТРАЦИЕЙ (публичный)
@Get()
async findAll(@Query() filters: ProductFiltersDto) {
  return this.productsService.findAll(filters);
}

  // ПОЛУЧИТЬ ТОВАР ПО ID (публичный)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // СОЗДАТЬ ТОВАР (только админ/модератор)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // ОБНОВИТЬ ТОВАР (только админ/модератор)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  // УДАЛИТЬ ТОВАР (только админ/модератор)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  // МАССОВОЕ СОЗДАНИЕ ТОВАРОВ (только админ/модератор)
@Post('bulk')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
async bulkCreate(@Body() bulkCreateProductsDto: BulkCreateProductsDto) {
  return this.productsService.bulkCreate(bulkCreateProductsDto);
}

@Post('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
@UseInterceptors(FileInterceptor('file'))
async uploadProducts(@UploadedFile() file: Express.Multer.File) {
  console.log('Uploaded file:', file); // ← ДЛЯ ДЕБАГА
  if (!file) {
    throw new Error('File is required');
  }
  return this.productsService.uploadProducts(file);
}


}