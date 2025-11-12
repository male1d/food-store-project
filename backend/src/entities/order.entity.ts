import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ default: 'pending' })
  status: string; // 'pending', 'paid', 'collected', 'shipped', 'delivered', 'cancelled'

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column('text')
  delivery_address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}