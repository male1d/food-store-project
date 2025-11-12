import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { OrderFiltersDto } from './dto/order-filters.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(+id, updateUserRoleDto);
  }

  @Put('users/:id/status')
  async updateUserStatus(@Param('id') id: string, @Body() updateUserStatusDto: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(+id, updateUserStatusDto);
  }

  // УПРАВЛЕНИЕ ЗАКАЗАМИ

  @Get('orders/filtered')
  async getFilteredOrders(@Query() filters: OrderFiltersDto) {
    return this.adminService.getFilteredOrders(filters);
  }

  // СТАТИСТИКА

  @Get('stats')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }
}