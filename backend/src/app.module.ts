import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';  
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Category } from './entities/category.entity';
import { UserAddress } from './entities/user-address.entity';
import { ProfileModule } from './profile/profile.module'; 
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module'; 

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database.sqlite',
      entities: [User, Product, Order, OrderItem, Category, UserAddress],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    UsersModule,  
    ProfileModule,
    OrdersModule,
    AdminModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}