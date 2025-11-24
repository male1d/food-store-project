import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  // СОЗДАТЬ КАТЕГОРИЮ
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  // ПОЛУЧИТЬ ВСЕ КАТЕГОРИИ
  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  // ПОЛУЧИТЬ КАТЕГОРИЮ ПО ID
  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // ПОЛУЧИТЬ КАТЕГОРИЮ ПО SLUG
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { slug },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // ОБНОВИТЬ КАТЕГОРИЮ
  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    
    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  // УДАЛИТЬ КАТЕГОРИЮ
  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
  }

  // ПОЛУЧИТЬ ДОЧЕРНИЕ КАТЕГОРИИ
  async findChildren(parentId: number): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { parent_id: parentId },
      relations: ['children'],
      order: { name: 'ASC' },
    });
  }
}