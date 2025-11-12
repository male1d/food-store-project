import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // ПОЛУЧИТЬ ВСЕ АДРЕСА ПОЛЬЗОВАТЕЛЯ
  @Get('addresses')
  async getAddresses(@Request() req) {
    return this.profileService.getUserAddresses(req.user.id);
  }

  // ДОБАВИТЬ НОВЫЙ АДРЕС
  @Post('addresses')
  async addAddress(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    return this.profileService.addAddress(req.user.id, createAddressDto);
  }

  // ОБНОВИТЬ АДРЕС
  @Put('addresses/:id')
  async updateAddress(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto
  ) {
    return this.profileService.updateAddress(+id, req.user.id, updateAddressDto);
  }

  // УДАЛИТЬ АДРЕС
  @Delete('addresses/:id')
  async deleteAddress(@Request() req, @Param('id') id: string) {
    return this.profileService.deleteAddress(+id, req.user.id);
  }

  // ПОЛУЧИТЬ АДРЕС ПО УМОЛЧАНИЮ
  @Get('addresses/default')
  async getDefaultAddress(@Request() req) {
    return this.profileService.getDefaultAddress(req.user.id);
  }
}