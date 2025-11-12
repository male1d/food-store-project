import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Получаем роли из декоратора @Roles()
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    
    // Если роли не указаны - доступ разрешен всем
    if (!requiredRoles) {
      return true;
    }

    // Получаем пользователя из запроса
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Проверяем есть ли у пользователя нужная роль
    return requiredRoles.includes(user.role);
  }
}