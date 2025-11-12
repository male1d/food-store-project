import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // РЕГИСТРАЦИЯ - создаем нового пользователя
  async register(createUserDto: any) {
    // Хешируем пароль перед сохранением
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const userData = {
      email: createUserDto.email,
      password_hash: hashedPassword,
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      phone: createUserDto.phone,
      role: createUserDto.role || 'user'
    };
    
    const user = this.usersRepository.create(userData);
    await this.usersRepository.save(user);
    
    // Убираем пароль из ответа для безопасности
    const { password_hash, ...result } = user;
    return result;
  }

  // ЛОГИН - проверяем данные и выдаем токен
  async login(loginUserDto: any) {
    // Ищем пользователя по email
    const user = await this.usersRepository.findOne({
      where: { email: loginUserDto.email }
    });

    // Проверяем пароль с помощью bcrypt
    if (!user || !(await bcrypt.compare(loginUserDto.password, user.password_hash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Создаем JWT токен
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    };
  }

  // ВАЛИДАЦИЯ пользователя по ID (для JWT)
  async validateUser(payload: any) {
    return await this.usersRepository.findOne({
      where: { id: payload.sub }
    });
  }
}