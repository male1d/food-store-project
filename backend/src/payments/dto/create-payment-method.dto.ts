export class CreatePaymentMethodDto {
  card_number: string;
  card_holder: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  is_default?: boolean;
}
