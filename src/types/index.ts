// Tipos alineados con los esquemas Mongoose del backend Vinyls & More

export type UserRole = "user" | "admin" | "seller";

export interface Address {
  country?: string;
  city?: string;
  details?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  address?: Address;
  phone?: string;
  createdAt?: string;
}

export type Format = "CD" | "Vinyl" | "Cassette";
export type Condition = "new" | "used";

export interface Product {
  _id: string;
  title: string;
  artist: string;
  genre: string;
  format: string;
  year?: number;
  condition: "new" | "used";
  price: number;
  stock: number;
  description?: string;

  imageUrl?: string; // ✅ AÑADE ESTO

  images?: string[]; // (opcional si lo sigues usando)
  isSecondHand?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  // útil para UI:
  product?: Product;
}

export interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
}

export type OrderStatus = "pending" | "shipped" | "delivered";

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: string;
}

export interface Review {
  _id: string;
  userId: string;
  userName?: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface SecondHandSubmission {
  _id: string;
  productId: string;
  sellerId: string;
  conditionDetails: string;
  realImages: string[];
  approved: boolean;
  createdAt: string;
  // joined for UI
  product?: Product;
  sellerName?: string;
}
