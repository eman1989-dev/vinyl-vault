// Capa de servicios — preparada para conectar con tu backend Express + MongoDB.
// Capa de servicios conectada al backend con Express + MongoDB. Cada función hace un fetch a la API REST y devuelve los datos.
// de cada función por un fetch a `${API_BASE_URL}/...` con tu JWT.

import type {
  Order, Product, Review, SecondHandSubmission, User, OrderStatus,
} from "@/types";

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";


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
    return apiFetch<Product[]>("/product");
  },
  async get(id: string): Promise<Product> {
      return apiFetch<Product>(`/product/${id}`);
    },
    async create(data: any): Promise<Product> {
    return apiFetch<Product>("/product", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: any): Promise<Product> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    return fetch(`${API_BASE_URL}/product/${id}`, {
      method: "PUT",
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error("Error al actualizar");
      return res.json();
    });
  },
  async remove(id: string): Promise<void> {
    return apiFetch<void>(`/product/${id}`, {
      method: "DELETE",
    });
  }
};

// ============= AUTH =============
export const authApi = {
  async login(email: string, password: string) {
    return apiFetch<{ user: User; token: string }>("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(
    name: string,
    email: string,
    password: string,
    extra?: {
      phone?: string;
      address?: { country?: string; city?: string; details?: string };
    }
  ) {
    return apiFetch<{ user: User; token: string }>("/user", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        phone: extra?.phone,
        address: extra?.address,
      }),
    });
  }
};

// ============= ÓRDENES =============
export const ordersApi = {
  async listAll(): Promise<Order[]> {
    return apiFetch<Order[]>("/orden");
  },

  async create(order: any): Promise<Order> {
    return apiFetch<Order>("/orden", {
      method: "POST",
      body: JSON.stringify(order),
    });
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return apiFetch<Order>(`/orden/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },
};

// ============= REVIEWS =============
export const reviewsApi = {
  async listByProduct(productId: string): Promise<Review[]> {
    return apiFetch<Review[]>(`/review/product/${productId}`);
  },

  async create(review: {
    productId: string;
    userId: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    return apiFetch<Review>("/review", {
      method: "POST",
      body: JSON.stringify(review),
    });
  },
};
// ============= SEGUNDA MANO =============
export const secondHandApi = {
  // 🔹 Obtener todos
  async listAll(): Promise<SecondHandSubmission[]> {
    return apiFetch<SecondHandSubmission[]>("/segunda");
  },

  // 🔹 Obtener por ID
  async getById(id: string): Promise<SecondHandSubmission> {
    return apiFetch<SecondHandSubmission>(`/segunda/${id}`);
  },

  // 🔹 Obtener por vendedor
  async listBySeller(sellerId: string): Promise<SecondHandSubmission[]> {
    return apiFetch<SecondHandSubmission[]>(`/segunda/seller/${sellerId}`);
  },

  // 🔹 Crear
  async create(
    submission: Omit<SecondHandSubmission, "_id" | "createdAt" | "approved">
  ): Promise<SecondHandSubmission> {
    return apiFetch<SecondHandSubmission>("/segunda", {
      method: "POST",
      body: JSON.stringify(submission),
    });
  },

  // 🔹 Actualizar
  async update(
    id: string,
    data: Partial<SecondHandSubmission>
  ): Promise<SecondHandSubmission> {
    return apiFetch<SecondHandSubmission>(`/segunda/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // 🔹 Aprobar (admin)
  async approve(id: string): Promise<SecondHandSubmission> {
    return apiFetch<SecondHandSubmission>(`/segunda/${id}/approve`, {
      method: "PUT",
    });
  },

  // 🔹 Eliminar
  async delete(id: string): Promise<void> {
    return apiFetch<void>(`/segunda/${id}`, {
      method: "DELETE",
    });
  },
};

// ============= USUARIOS (admin) =============
export const usersApi = {
    async listAll(): Promise<User[]> {
      return apiFetch<User[]>("/user");
    },

    async getById(id: string): Promise<User> {
      return apiFetch<User>(`/user/${id}`);
    },

    async update(id: string, data: Partial<User>): Promise<User> {
      return apiFetch<User>(`/user/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async delete(id: string): Promise<void> {
      return apiFetch<void>(`/user/${id}`, {
        method: "DELETE",
      });
    },
  };