import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Category } from './category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  article: string;

  @Column({ nullable: true })
  image_url: string;

  @Column('int')
  quantity: number;

  @Column()
  unit: string;

  @Column('simple-json', { nullable: true })
  nutritional_value: any;

  @Column('text', { nullable: true })
  composition: string;

  @Column({ nullable: true })
  category_id: number;

  @ManyToOne(() => Category, category => category.products)
  category: Category;

  @CreateDateColumn()
  created_at: Date;
}