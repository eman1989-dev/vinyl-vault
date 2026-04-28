import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/services/api";
import type { Order } from "@/types";
import { formatCOP, formatDate } from "@/lib/format";
import { CheckCircle2, Package, Truck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const statusMap = {
  pending: { label: "Pendiente", icon: Clock, color: "text-mustard-deep bg-mustard/20" },
  shipped: { label: "Enviado", icon: Truck, color: "text-burnt bg-burnt/15" },
  delivered: { label: "Entregado", icon: CheckCircle2, color: "text-olive bg-olive/15" },
} as const;

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [params] = useSearchParams();
  const newOrderId = params.get("nuevo");

  useEffect(() => {
    if (user) ordersApi.listForUser(user._id).then(setOrders);
  }, [user]);

  return (
    <div className="container py-12">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-burnt mb-2">Tu historial</p>
        <h1 className="font-display text-5xl text-brown-ink">Mis pedidos</h1>
      </header>

      {newOrderId && (
        <div className="mb-8 bg-olive/15 border-l-4 border-olive p-5">
          <p className="font-semibold text-brown-ink">¡Pedido confirmado!</p>
          <p className="text-sm text-muted-foreground">Recibirás actualizaciones por correo.</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-brown-ink/20">
          <Package className="h-14 w-14 mx-auto text-brown-ink/30" strokeWidth={1.2} />
          <p className="mt-4 font-display text-2xl text-brown-ink">Aún no tienes pedidos</p>
          <Link to="/catalogo" className="inline-block mt-4 text-burnt-deep font-semibold hover:underline">
            Explorar catálogo →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => {
            const s = statusMap[o.status];
            const Icon = s.icon;
            return (
              <article key={o._id} className="bg-card border border-brown-ink/10 p-6">
                <header className="flex flex-wrap justify-between gap-4 pb-4 border-b border-brown-ink/10">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Pedido #{o._id.slice(-6).toUpperCase()}</p>
                    <p className="font-display text-xl text-brown-ink">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider font-semibold", s.color)}>
                      <Icon className="h-3.5 w-3.5" /> {s.label}
                    </span>
                    <span className="font-display text-2xl text-brown-ink">{formatCOP(o.totalAmount)}</span>
                  </div>
                </header>
                <ul className="mt-4 space-y-1 text-sm">
                  {o.items.map((it) => (
                    <li key={it.productId} className="flex justify-between text-brown-ink/80">
                      <span>{it.title} <span className="text-muted-foreground">x{it.quantity}</span></span>
                      <span>{formatCOP(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground italic">
                  Envío a: {o.shippingAddress.city}, {o.shippingAddress.country} — {o.shippingAddress.details}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
