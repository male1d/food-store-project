import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module'; 
import { PaymentsModule } from './payments/payments.module'; 

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    UsersModule,
    ProfileModule,
    OrdersModule,
    AdminModule,
    ProductsModule,
    CategoriesModule,
    PaymentsModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}