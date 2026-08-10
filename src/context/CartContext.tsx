import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import type { CartItem, Product } from "@/types";
import { productsApi } from "@/services/api";

export type AddResult =
  | { ok: true; newStock: number }
  | { ok: false; reason: "stock" | "api" };

interface CartCtx {
  items: CartItem[];
  add: (product: Product, qty?: number) => Promise<AddResult>;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartCtx | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const s = localStorage.getItem("vm_cart");
    return s ? JSON.parse(s) : [];
  });

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
    localStorage.setItem("vm_cart", JSON.stringify(items));
  }, [items]);

  const add = async (product: Product, qty = 1): Promise<AddResult> => {
    if (qty <= 0) return { ok: false, reason: "stock" };

    let latest: Product;
    try {
      latest = await productsApi.get(product._id);
    } catch {
      latest = product;
    }

    if (qty > latest.stock) return { ok: false, reason: "stock" };

    const newStock = latest.stock - qty;
    try {
      await productsApi.update(product._id, { stock: newStock });
    } catch {
      return { ok: false, reason: "api" };
    }

    const snapshot = { ...product, stock: newStock };
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + qty, product: snapshot } : i
        );
      }
      return [
        ...prev,
        { productId: product._id, quantity: qty, price: product.price, product: snapshot },
      ];
    });

    return { ok: true, newStock };
  };

  const remove = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const setQty = (productId: string, qty: number) =>
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const max = Math.max(i.quantity, i.quantity + (i.product?.stock ?? 0));
          return { ...i, quantity: Math.min(Math.max(1, qty), max) };
        })
        .filter((i) => i.quantity > 0)
    );

  const clear = () => setItems([]);

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
