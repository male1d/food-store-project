import { Controller, Get, Param, Put, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ПОЛУЧИТЬ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (только админ)
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  // ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
  @Get('me')
  async getCurrentUser(@Request() req) {
    return this.usersService.findCurrentUser(req.user.id);
  }

  // ПОЛУЧИТЬ ПОЛЬЗОВАТЕЛЯ ПО ID (только админ)
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // ОБНОВИТЬ ПОЛЬЗОВАТЕЛЯ
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.update(+id, updateUserDto, req.user);
  }

  // УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ (только админ)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(+id, req.user);
  }
}