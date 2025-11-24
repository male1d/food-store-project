export class CreateProductDto {
  name: string;
  description?: string;
  price: number;
  article: string;
  image_url?: string;
  quantity: number;
  unit?: string;
  nutritional_value?: string;
  composition?: string;
  category_id: number;
}