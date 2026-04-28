import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { CartItem, Product } from "@/types";

interface CartCtx {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
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

  useEffect(() => {
    localStorage.setItem("vm_cart", JSON.stringify(items));
  }, [items]);

  const add = (product: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prev,
        { productId: product._id, quantity: qty, price: product.price, product },
      ];
    });
  };

  const remove = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const setQty = (productId: string, qty: number) =>
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i))
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
