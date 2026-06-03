export type UserRole = 'guest' | 'user' | 'manager' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  login: string;
  phone: string;
  passwordHash: string;
  role: UserRole;             // Добавлено свойство роли
  recommendedTags?: string[]; // Добавлено свойство интересов
}

export interface Session {
  sessionId: string;
  userId: string;
  expiresAt: number;
  role: UserRole;             // Добавлено свойство роли сессии
}

export interface ProductTranslation {
  title: string;
  description: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  stockCount: number;
  tags: string[];
  translations?: {
    [locale: string]: ProductTranslation;
  };
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

export interface Comment {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}