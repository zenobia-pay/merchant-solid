export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  colors: string[];
  sizes?: string[];
  featured?: boolean;
  new?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  color?: string;
  size?: string;
}
