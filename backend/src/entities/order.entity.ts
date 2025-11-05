import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User, user => user.orders)
  user: User;

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

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  order_items: OrderItem[];
}