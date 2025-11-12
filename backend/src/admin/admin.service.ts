import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { OrderFiltersDto } from './dto/order-filters.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  // ПОЛУЧИТЬ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'role', 'first_name', 'last_name', 'phone', 'created_at', 'is_active'],
      order: { created_at: 'DESC' }
    });
  }

  // ИЗМЕНИТЬ РОЛЬ ПОЛЬЗОВАТЕЛЯ
  async updateUserRole(userId: number, updateUserRoleDto: UpdateUserRoleDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем валидность роли
    const validRoles = ['admin', 'moderator', 'user'];
    if (!validRoles.includes(updateUserRoleDto.role)) {
      throw new NotFoundException('Invalid role');
    }

    user.role = updateUserRoleDto.role;
    return this.usersRepository.save(user);
  }

  // БЛОКИРОВКА/РАЗБЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ
  async updateUserStatus(userId: number, updateUserStatusDto: UpdateUserStatusDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = updateUserStatusDto.is_active;
    return this.usersRepository.save(user);
  }

  // ФИЛЬТРАЦИЯ ЗАКАЗОВ
  async getFilteredOrders(filters: OrderFiltersDto): Promise<Order[]> {
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

    return this.ordersRepository.find({
      where,
      relations: ['user', 'order_items'],
      order: { created_at: 'DESC' }
    });
  }

  // СТАТИСТИКА СИСТЕМЫ
  async getSystemStats() {
    const totalUsers = await this.usersRepository.count();
    const totalOrders = await this.ordersRepository.count();
    const totalRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'total')
      .where('order.status = :status', { status: 'delivered' })
      .getRawOne();

    return {
      total_users: totalUsers,
      total_orders: totalOrders,
      total_revenue: totalRevenue.total || 0,
      pending_orders: await this.ordersRepository.count({ where: { status: 'pending' } }),
      active_users: await this.usersRepository.count({ where: { is_active: true } }),
    };
  }
}