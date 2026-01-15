import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Order } from '../entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, Order])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
