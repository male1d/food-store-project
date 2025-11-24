import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { BulkCreateProductsDto } from './dto/bulk-create-products.dto';
import { UploadResult } from './interfaces/upload-result.interface';


@Injectable()
export class ProductsService {  // ← ВАЖНО: export class
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // СОЗДАТЬ ТОВАР
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

// ПОЛУЧИТЬ ВСЕ ТОВАРЫ С ФИЛЬТРАЦИЕЙ
async findAll(filters: ProductFiltersDto): Promise<Product[]> {
  // ЕСЛИ ЕСТЬ ПОИСК - ИСПОЛЬЗУЕМ РЕГИСТРОНЕЗАВИСИМЫЙ ПОИСК
  if (filters.search) {
    return this.searchProducts(filters.search);
  }

  const where: any = {};

  // ФИЛЬТР ПО КАТЕГОРИИ
  if (filters.category_id) {
    where.category_id = filters.category_id;
  }

  // ФИЛЬТР ПО ЦЕНЕ
  if (filters.min_price !== undefined || filters.max_price !== undefined) {
    where.price = Between(
      filters.min_price || 0,
      filters.max_price || 999999,
    );
  }

  return this.productsRepository.find({
    where,
    relations: ['category'],
    order: { created_at: 'DESC' },
  });
}

// ПОИСК ТОВАРОВ БЕЗ УЧЕТА РЕГИСТРА
async searchProducts(search: string): Promise<Product[]> {
  return this.productsRepository
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.category', 'category')
    .where('LOWER(product.name) LIKE LOWER(:search)', { search: `%${search}%` })
    .orWhere('LOWER(product.description) LIKE LOWER(:search)', { search: `%${search}%` })
    .orderBy('product.created_at', 'DESC')
    .getMany();
}

  // ПОЛУЧИТЬ ТОВАР ПО ID
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // ОБНОВИТЬ ТОВАР
  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  // УДАЛИТЬ ТОВАР
  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  // МАССОВОЕ СОЗДАНИЕ ТОВАРОВ
async bulkCreate(bulkCreateProductsDto: BulkCreateProductsDto): Promise<Product[]> {
  const products = this.productsRepository.create(bulkCreateProductsDto.products);
  return this.productsRepository.save(products);
}

// ЗАГРУЗКА ТОВАРОВ ИЗ CSV/EXCEL
async uploadProducts(file: Express.Multer.File): Promise<UploadResult> {
  const result: UploadResult = {
    success: 0,
    errors: [],
    total: 0
  };

  try {
    console.log('File upload working! File:', file.originalname);

    // ПРЕОБРАЗУЕМ CSV В ТЕКСТ И РАЗБИВАЕМ НА СТРОКИ
    const fileContent = file.buffer.toString('utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    
    console.log('CSV lines:', lines);

    // ПРОПУСКАЕМ ЗАГОЛОВОК (ПЕРВУЮ СТРОКУ)
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i];
        const columns = line.split(',');
        
        console.log('Processing line:', line);
        console.log('Columns:', columns);

        // ПАРСИМ ДАННЫЕ ИЗ CSV
        const createProductDto: CreateProductDto = {
          name: columns[0]?.replace(/"/g, '').trim(),           // name
          description: columns[1]?.replace(/"/g, '').trim(),    // description
          price: parseFloat(columns[2]?.replace(/"/g, '') || '100'), // price
          article: columns[3]?.replace(/"/g, '').trim(),        // article
          quantity: parseInt(columns[4]?.replace(/"/g, '') || '10'), // quantity
          unit: columns[5]?.replace(/"/g, '').trim() || 'шт',   // unit
          category_id: parseInt(columns[6]?.replace(/"/g, '') || '1') // category_id
        };

        console.log('Creating product:', createProductDto);

        // СОХРАНЯЕМ ТОВАР В БАЗУ
        await this.create(createProductDto);
        result.success++;
        
      } catch (error) {
        result.errors.push(`Error with line ${i}: ${error.message}`);
      }
    }

    result.total = lines.length - 1; // минус заголовок

    return result;

  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`File processing error: ${error.message}`);
  }
}

}
