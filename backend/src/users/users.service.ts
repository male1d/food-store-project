import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // ПОЛУЧИТЬ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (только для админа)
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return users.map(user => this.toResponseDto(user));
  }

  // ПОЛУЧИТЬ ПОЛЬЗОВАТЕЛЯ ПО ID
  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponseDto(user);
  }

  // ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
  async findCurrentUser(userId: number): Promise<UserResponseDto> {
    return this.findOne(userId);
  }

  // ОБНОВИТЬ ПОЛЬЗОВАТЕЛЯ
  async update(id: number, updateUserDto: UpdateUserDto, currentUser: User): Promise<UserResponseDto> {
    // Проверяем что пользователь обновляет себя или это админ
    if (currentUser.id !== id && currentUser.role !== 'admin') {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Обновляем поля
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    return this.toResponseDto(updatedUser);
  }

  // УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ (только админ)
  async remove(id: number, currentUser: User): Promise<void> {
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admin can delete users');
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.remove(user);
  }

  // ПРЕОБРАЗОВАНИЕ В DTO (убираем пароль)
  private toResponseDto(user: User): UserResponseDto {
    const { password_hash, ...userData } = user;
    return userData as UserResponseDto;
  }
}