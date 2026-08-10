import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User } from "@/types";
import { authApi } from "@/services/api";

interface RegisterExtras {
  phone?: string;
  address?: { country?: string; city?: string; details?: string };
  role?: "user" | "seller" | "admin";
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, extras?: RegisterExtras) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const normalizeUser = (u: User & { id?: string }): User => ({
  ...u,
  _id: u._id ?? u.id ?? "",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("vm_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") setUser(normalizeUser(parsed));
      } catch {
        /* carrito/user corrupto */
      }
    }
    setLoading(false);
  }, []);

  const persist = (u: User, token: string) => {
    const normalized = normalizeUser(u);
    localStorage.setItem("vm_user", JSON.stringify(normalized));
    localStorage.setItem("vm_token", token || "");
    setUser(normalized);
  };

  const login = async (email: string, password: string) => {
    const { user, token } = await authApi.login(email, password);
    persist(user, token);
  };

  const register = async (name: string, email: string, password: string, extras?: RegisterExtras) => {
    const { user, token } = await authApi.register(name, email, password, extras);
    persist(user, token);
  };

  const logout = () => {
    localStorage.removeItem("vm_user");
    localStorage.removeItem("vm_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

