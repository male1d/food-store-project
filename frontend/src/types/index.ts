export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  article: string;
  image_url?: string;
  quantity: number;
  unit?: string;
  category_id: number;
  nutritional_value?: string;
  composition?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  children?: Category[];
}

