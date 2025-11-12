import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
  ) {}

  // ПОЛУЧИТЬ ВСЕ ЗАКАЗЫ ПОЛЬЗОВАТЕЛЯ
  async getUserOrders(userId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user_id: userId },
      relations: ['order_items'],
      order: { created_at: 'DESC' }
    });
  }

  // ПОЛУЧИТЬ ЗАКАЗ ПОЛЬЗОВАТЕЛЯ ПО ID
  async getUserOrder(orderId: number, userId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, user_id: userId },
      relations: ['order_items']
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // ПОЛУЧИТЬ ВСЕ ЗАКАЗЫ (ДЛЯ АДМИНА/МОДЕРАТОРА)
  async getAllOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['order_items', 'user'],
      order: { created_at: 'DESC' }
    });
  }

  // ПОЛУЧИТЬ ЛЮБОЙ ЗАКАЗ ПО ID (ДЛЯ АДМИНА/МОДЕРАТОРА)
  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['order_items', 'user']
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // ОБНОВИТЬ СТАТУС ЗАКАЗА
  async updateOrderStatus(orderId: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Проверяем валидность статуса
    const validStatuses = ['pending', 'paid', 'collected', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(updateOrderStatusDto.status)) {
      throw new NotFoundException('Invalid order status');
    }

    order.status = updateOrderStatusDto.status;
    return this.ordersRepository.save(order);
  }

  // СОЗДАТЬ НОВЫЙ ЗАКАЗ
  async createOrder(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    // Рассчитываем общую сумму
    const totalAmount = createOrderDto.items.reduce((total, item) => {
      return total + (item.price_at_time * item.quantity);
    }, 0);

    // Создаем заказ
    const order = this.ordersRepository.create({
      user_id: userId,
      delivery_address: createOrderDto.delivery_address,
      phone: createOrderDto.phone,
      email: createOrderDto.email,
      total_amount: totalAmount,
      status: 'pending'
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Создаем элементы заказа
    const orderItems = createOrderDto.items.map(item => 
      this.orderItemsRepository.create({
        order_id: savedOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.price_at_time
      })
    );

    savedOrder.order_items = await this.orderItemsRepository.save(orderItems);

    return savedOrder;
  }
}