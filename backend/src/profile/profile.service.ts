import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddress } from '../entities/user-address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
  ) {}

  // ПОЛУЧИТЬ ВСЕ АДРЕСА ПОЛЬЗОВАТЕЛЯ
  async getUserAddresses(userId: number): Promise<UserAddress[]> {
    return this.userAddressRepository.find({
      where: { user_id: userId },
      order: { is_default: 'DESC', created_at: 'DESC' }
    });
  }

  // ДОБАВИТЬ НОВЫЙ АДРЕС
  async addAddress(userId: number, createAddressDto: CreateAddressDto): Promise<UserAddress> {
    // Если это адрес по умолчанию - снимаем флаг с других адресов
    if (createAddressDto.is_default) {
      await this.userAddressRepository.update(
        { user_id: userId, is_default: true },
        { is_default: false }
      );
    }

    const address = this.userAddressRepository.create({
      ...createAddressDto,
      user_id: userId
    });

    return this.userAddressRepository.save(address);
  }

  // ОБНОВИТЬ АДРЕС
  async updateAddress(
    addressId: number, 
    userId: number, 
    updateAddressDto: UpdateAddressDto
  ): Promise<UserAddress> {
    const address = await this.userAddressRepository.findOne({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Если устанавливаем как адрес по умолчанию
    if (updateAddressDto.is_default) {
      await this.userAddressRepository.update(
        { user_id: userId, is_default: true },
        { is_default: false }
      );
    }

    Object.assign(address, updateAddressDto);
    return this.userAddressRepository.save(address);
  }

  // УДАЛИТЬ АДРЕС
  async deleteAddress(addressId: number, userId: number): Promise<void> {
    const address = await this.userAddressRepository.findOne({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.userAddressRepository.remove(address);
  }

  // ПОЛУЧИТЬ АДРЕС ПО УМОЛЧАНИЮ
  async getDefaultAddress(userId: number): Promise<UserAddress | null> {
    return this.userAddressRepository.findOne({
      where: { user_id: userId, is_default: true }
    });
  }
}