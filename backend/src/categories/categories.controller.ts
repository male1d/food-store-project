import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ПОЛУЧИТЬ ВСЕ КАТЕГОРИИ (публичный)
  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  // ПОЛУЧИТЬ КАТЕГОРИЮ ПО ID (публичный)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  // ПОЛУЧИТЬ КАТЕГОРИЮ ПО SLUG (публичный)
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  // ПОЛУЧИТЬ ДОЧЕРНИЕ КАТЕГОРИИ (публичный)
  @Get('parent/:parentId')
  async findChildren(@Param('parentId') parentId: string) {
    return this.categoriesService.findChildren(+parentId);
  }

  // СОЗДАТЬ КАТЕГОРИЮ (только админ/модератор)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  // ОБНОВИТЬ КАТЕГОРИЮ (только админ/модератор)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  // УДАЛИТЬ КАТЕГОРИЮ (только админ/модератор)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}