export interface User {
  id: string;
  name: string;
  email: string;
  login: string;
  phone: string;
  passwordHash: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  expiresAt: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  stockCount: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
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