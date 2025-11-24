import { Controller, Get, Param, Put, Body, Post, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Query } from '@nestjs/common';

@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ИСТОРИЯ ЗАКАЗОВ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
  @Get('users/me/orders')
  async getUserOrders(@Request() req) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  // ДЕТАЛИ ЗАКАЗА ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
  @Get('users/me/orders/:id')
  async getUserOrder(@Request() req, @Param('id') id: string) {
    return this.ordersService.getUserOrder(+id, req.user.id);
  }

  // ВСЕ ЗАКАЗЫ (ДЛЯ АДМИНА/МОДЕРАТОРА)
  @Get('orders')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  // ДЕТАЛИ ЛЮБОГО ЗАКАЗА (ДЛЯ АДМИНА/МОДЕРАТОРА)
  @Get('orders/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(+id);
  }

  // ФИЛЬТРАЦИЯ ЗАКАЗОВ (ДЛЯ АДМИНА/МОДЕРАТОРА)
@Get('admin/filtered')
@UseGuards(RolesGuard)
@Roles('admin', 'moderator')
async getFilteredOrders(@Query() filters: any) {
  return this.ordersService.getFilteredOrders(filters);
}

  // ОБНОВЛЕНИЕ СТАТУСА ЗАКАЗА
  @Put('orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  async updateOrderStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(+id, updateOrderStatusDto);
  }

  // СОЗДАНИЕ НОВОГО ЗАКАЗА
  @Post('orders')
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }
}