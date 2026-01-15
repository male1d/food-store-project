import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('methods')
  async addPaymentMethod(@Request() req, @Body() dto: CreatePaymentMethodDto) {
    return this.paymentsService.addPaymentMethod(req.user.id, dto);
  }

  @Get('methods')
  async getPaymentMethods(@Request() req) {
    return this.paymentsService.getUserPaymentMethods(req.user.id);
  }

  @Post('process')
  async processPayment(@Body() dto: ProcessPaymentDto) {
    return this.paymentsService.processPayment(dto);
  }

  @Delete('methods/:id')
  async removePaymentMethod(@Request() req, @Param('id') id: string) {
    return this.paymentsService.removePaymentMethod(req.user.id, +id);
  }

  @Put('methods/:id/default')
  async setDefaultPaymentMethod(@Request() req, @Param('id') id: string) {
    return this.paymentsService.setDefaultPaymentMethod(req.user.id, +id);
  }
}
