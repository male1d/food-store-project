import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // РЕГИСТРАЦИЯ - доступна всем
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  // ЛОГИН - доступен всем
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  // ПРОФИЛЬ - только для авторизованных
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    // req.user содержит данные из JWT токена
    return {
      message: 'This is your profile',
      user: req.user
    };
  }

  // АДМИН ПАНЕЛЬ - только для админов
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAdminData(@Request() req) {
    return {
      message: 'Welcome to admin panel!',
      user: req.user
    };
  }

  // МОДЕРАТОР ПАНЕЛЬ - для админов и модераторов
  @Get('moderator')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  getModeratorData(@Request() req) {
    return {
      message: 'Welcome to moderator panel!',
      user: req.user
    };
  }
}