import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ nullable: true })
  slug: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}