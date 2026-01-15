import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Order } from '../entities/order.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodsRepository: Repository<PaymentMethod>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async addPaymentMethod(userId: number, dto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const cardNumber = dto.card_number.replace(/\s/g, '');
    
    let cardType = 'other';
    if (cardNumber.startsWith('4')) cardType = 'visa';
    else if (cardNumber.startsWith('5')) cardType = 'mastercard';
    else if (cardNumber.startsWith('2')) cardType = 'mir';

    const lastFourDigits = cardNumber.slice(-4);

    if (dto.is_default) {
      await this.paymentMethodsRepository.update(
        { user_id: userId, is_default: true },
        { is_default: false }
      );
    }

    const paymentMethod = this.paymentMethodsRepository.create({
      user_id: userId,
      card_type: cardType,
      last_four_digits: lastFourDigits,
      is_default: dto.is_default || false,
    });

    return this.paymentMethodsRepository.save(paymentMethod);
  }

  async getUserPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return this.paymentMethodsRepository.find({
      where: { user_id: userId },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  async processPayment(dto: ProcessPaymentDto): Promise<{ success: boolean; transaction_id?: string; message: string }> {
    const order = await this.ordersRepository.findOne({
      where: { id: dto.order_id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      order.payment_status = 'paid';
      order.status = 'paid';
      order.transaction_id = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      if (dto.payment_method_id) {
        order.payment_method_id = dto.payment_method_id;
      }

      await this.ordersRepository.save(order);

      return {
        success: true,
        transaction_id: order.transaction_id,
        message: 'Payment successful',
      };
    } else {
      order.payment_status = 'failed';
      await this.ordersRepository.save(order);

      return {
        success: false,
        message: 'Payment failed. Please try again.',
      };
    }
  }

  async removePaymentMethod(userId: number, paymentMethodId: number): Promise<void> {
    const paymentMethod = await this.paymentMethodsRepository.findOne({
      where: { id: paymentMethodId, user_id: userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    await this.paymentMethodsRepository.remove(paymentMethod);
  }

  async setDefaultPaymentMethod(userId: number, paymentMethodId: number): Promise<PaymentMethod> {
    await this.paymentMethodsRepository.update(
      { user_id: userId, is_default: true },
      { is_default: false }
    );

    const paymentMethod = await this.paymentMethodsRepository.findOne({
      where: { id: paymentMethodId, user_id: userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    paymentMethod.is_default = true;
    return this.paymentMethodsRepository.save(paymentMethod);
  }
}
