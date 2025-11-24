import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Between, Like } from 'typeorm';
import { Product } from '../entities/product.entity';


@Injectable()
export class OrdersService {
  constructor(
  @InjectRepository(Order)
  private ordersRepository: Repository<Order>,
  @InjectRepository(OrderItem) 
  private orderItemsRepository: Repository<OrderItem>,
  @InjectRepository(Product) // ← ЭТОТ ДОЛЖЕН БЫТЬ
  private productsRepository: Repository<Product>,
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

  // ФИЛЬТРАЦИЯ ЗАКАЗОВ ДЛЯ АДМИНОВ
async getFilteredOrders(filters: any): Promise<Order[]> {
  const where: any = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.user_id) {
    where.user_id = filters.user_id;
  }

  if (filters.start_date && filters.end_date) {
    where.created_at = Between(
      new Date(filters.start_date),
      new Date(filters.end_date)
    );
  }

  if (filters.search) {
    where.email = Like(`%${filters.search}%`);
  }

  return this.ordersRepository.find({
    where,
    relations: ['user', 'order_items', 'order_items.product'],
    order: { created_at: 'DESC' }
  });
}

// СОЗДАТЬ НОВЫЙ ЗАКАЗ С ПРОВЕРКОЙ ТОВАРОВ
async createOrder(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
  // ПРОВЕРЯЕМ НАЛИЧИЕ ТОВАРОВ И РАССЧИТЫВАЕМ СУММУ
  let totalAmount = 0;
  const orderItems = [];

  for (const item of createOrderDto.items) {
    const product = await this.productsRepository.findOne({
      where: { id: item.product_id }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${item.product_id} not found`);
    }

    if (product.quantity < item.quantity) {
      throw new NotFoundException(`Not enough quantity for product ${product.name}. Available: ${product.quantity}, requested: ${item.quantity}`);
    }

    // ОБНОВЛЯЕМ ОСТАТКИ ТОВАРА
    product.quantity -= item.quantity;
    await this.productsRepository.save(product);

    totalAmount += product.price * item.quantity;

    orderItems.push({
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: product.price // Используем актуальную цену из базы
    });
  }

  // СОЗДАЕМ ЗАКАЗ
  const order = this.ordersRepository.create({
    user_id: userId,
    delivery_address: createOrderDto.delivery_address,
    phone: createOrderDto.phone,
    email: createOrderDto.email,
    total_amount: totalAmount,
    status: 'pending'
  });

  const savedOrder = await this.ordersRepository.save(order);

  // СОЗДАЕМ ЭЛЕМЕНТЫ ЗАКАЗА
  const savedOrderItems = orderItems.map(item => 
    this.orderItemsRepository.create({
      order_id: savedOrder.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.price_at_time
    })
  );

  savedOrder.order_items = await this.orderItemsRepository.save(savedOrderItems);

  return savedOrder;
}
}