export class CreateOrderItemDto {
  product_id: number;
  quantity: number;
  price_at_time: number;
}

export class CreateOrderDto {
  delivery_address: string;
  phone: string;
  email: string;
  items: CreateOrderItemDto[];
}