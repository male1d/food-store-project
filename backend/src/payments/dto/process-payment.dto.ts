export class ProcessPaymentDto {
  order_id: number;
  payment_method_id?: number;
  card_details?: {
    card_number: string;
    card_holder: string;
    expiry_month: string;
    expiry_year: string;
    cvv: string;
  };
}
