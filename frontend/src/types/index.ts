export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  stockCount: number;
}

export interface PopulatedCartItem {
  product: Product;
  quantity: number;
}

export interface PopulatedCart {
  userId: string;
  items: PopulatedCartItem[];
  totalPrice: number;
}