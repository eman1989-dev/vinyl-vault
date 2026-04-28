// Capa de servicios — preparada para conectar con tu backend Express + MongoDB.
// Hoy retorna datos mock; cuando conectes tu API solo cambia la implementación
// de cada función por un fetch a `${API_BASE_URL}/...` con tu JWT.

import {
  mockOrders,
  mockProducts,
  mockReviews,
  mockSecondHand,
  mockUsers,
} from "@/data/mockData";
import type {
  Order, Product, Review, SecondHandSubmission, User, OrderStatus,
} from "@/types";

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// ---------- Helper genérico para cuando conectes el backend ----------
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("vm_token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ============= PRODUCTOS =============
export const productsApi = {
  async list(): Promise<Product[]> {
    await delay();
    return [...mockProducts];
  },
  async get(id: string): Promise<Product | undefined> {
    await delay();
    return mockProducts.find((p) => p._id === id);
  },
  async create(data: Omit<Product, "_id">): Promise<Product> {
    await delay();
    const created: Product = { ...data, _id: `p${Date.now()}` };
    mockProducts.push(created);
    return created;
  },
  async update(id: string, data: Partial<Product>): Promise<Product> {
    await delay();
    const i = mockProducts.findIndex((p) => p._id === id);
    if (i === -1) throw new Error("not found");
    mockProducts[i] = { ...mockProducts[i], ...data };
    return mockProducts[i];
  },
  async remove(id: string): Promise<void> {
    await delay();
    const i = mockProducts.findIndex((p) => p._id === id);
    if (i !== -1) mockProducts.splice(i, 1);
  },
};

// ============= AUTH =============
export const authApi = {
  async login(email: string, _password: string): Promise<{ user: User; token: string }> {
    await delay();
    const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error("Credenciales inválidas");
    return { user, token: `mock-token-${user._id}` };
  },
  async register(
    name: string,
    email: string,
    _password: string,
    extra?: { phone?: string; address?: { country?: string; city?: string; details?: string }; role?: "user" | "seller" | "admin" },
  ): Promise<{ user: User; token: string }> {
    await delay();
    if (mockUsers.find((u) => u.email === email.toLowerCase()))
      throw new Error("El correo ya está registrado");
    const user: User = {
      _id: `u${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role: extra?.role ?? "user",
      phone: extra?.phone,
      address: extra?.address,
    };
    mockUsers.push(user);
    return { user, token: `mock-token-${user._id}` };
  },
};

// ============= ÓRDENES =============
export const ordersApi = {
  async listForUser(userId: string): Promise<Order[]> {
    await delay();
    return mockOrders.filter((o) => o.userId === userId);
  },
  async listAll(): Promise<Order[]> {
    await delay();
    return [...mockOrders];
  },
  async create(order: Omit<Order, "_id" | "createdAt" | "status">): Promise<Order> {
    await delay();
    const created: Order = {
      ...order,
      _id: `o${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    mockOrders.unshift(created);
    return created;
  },
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await delay();
    const i = mockOrders.findIndex((o) => o._id === id);
    if (i === -1) throw new Error("not found");
    mockOrders[i].status = status;
    return mockOrders[i];
  },
};

// ============= REVIEWS =============
export const reviewsApi = {
  async listByProduct(productId: string): Promise<Review[]> {
    await delay();
    return mockReviews.filter((r) => r.productId === productId);
  },
  async create(review: Omit<Review, "_id" | "createdAt">): Promise<Review> {
    await delay();
    const created: Review = {
      ...review,
      _id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockReviews.push(created);
    return created;
  },
};

// ============= SEGUNDA MANO =============
export const secondHandApi = {
  async listAll(): Promise<SecondHandSubmission[]> {
    await delay();
    return [...mockSecondHand];
  },
  async listBySeller(sellerId: string): Promise<SecondHandSubmission[]> {
    await delay();
    return mockSecondHand.filter((s) => s.sellerId === sellerId);
  },
  async create(submission: Omit<SecondHandSubmission, "_id" | "createdAt" | "approved">): Promise<SecondHandSubmission> {
    await delay();
    const created: SecondHandSubmission = {
      ...submission,
      _id: `sh${Date.now()}`,
      approved: false,
      createdAt: new Date().toISOString(),
    };
    mockSecondHand.unshift(created);
    return created;
  },
  async approve(id: string): Promise<SecondHandSubmission> {
    await delay();
    const i = mockSecondHand.findIndex((s) => s._id === id);
    if (i === -1) throw new Error("not found");
    mockSecondHand[i].approved = true;
    return mockSecondHand[i];
  },
};

// ============= USUARIOS (admin) =============
export const usersApi = {
  async listAll(): Promise<User[]> {
    await delay();
    return [...mockUsers];
  },
};
