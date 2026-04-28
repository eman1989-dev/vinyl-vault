import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";

export default function CartPage() {
  const { items, setQty, remove, total, clear } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-brown-ink/30" strokeWidth={1.2} />
        <h1 className="mt-6 font-display text-4xl text-brown-ink">Tu carrito está vacío</h1>
        <p className="mt-3 font-serif-body italic text-muted-foreground">
          Empieza a llenarlo con sonido analógico y rarezas.
        </p>
        <Button asChild size="lg" className="mt-8 bg-burnt hover:bg-burnt-deep">
          <Link to="/catalogo">Ir al catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="font-display text-5xl text-brown-ink mb-10">Tu carrito</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.productId} className="flex gap-5 bg-card border border-brown-ink/10 p-4">
              <Link to={`/producto/${item.productId}`} className="w-28 h-28 flex-shrink-0 bg-cream-deep overflow-hidden">
                <img src={item.product?.images[0]} alt={item.product?.title} className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest text-burnt">{item.product?.artist}</p>
                <h3 className="font-display text-xl text-brown-ink truncate">{item.product?.title}</h3>
                <p className="text-sm text-muted-foreground italic">{item.product?.format}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center border border-brown-ink/30">
                    <button onClick={() => setQty(item.productId, item.quantity - 1)} className="p-2 hover:bg-mustard/20"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="px-3 text-sm w-10 text-center">{item.quantity}</span>
                    <button onClick={() => setQty(item.productId, item.quantity + 1)} className="p-2 hover:bg-mustard/20"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <button onClick={() => remove(item.productId)} className="text-muted-foreground hover:text-destructive p-2" aria-label="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl text-brown-ink">{formatCOP(item.price * item.quantity)}</div>
                <div className="text-xs text-muted-foreground">{formatCOP(item.price)} c/u</div>
              </div>
            </article>
          ))}
          <button onClick={clear} className="text-sm text-muted-foreground hover:text-destructive">Vaciar carrito</button>
        </div>

        <aside className="bg-brown-ink text-cream p-8 h-fit vinyl-shadow">
          <h2 className="font-display text-2xl mb-6">Resumen</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCOP(total)}</dd></div>
            <div className="flex justify-between"><dt>Envío</dt><dd className="italic text-mustard">Calculado en checkout</dd></div>
          </dl>
          <div className="mt-6 pt-6 border-t border-cream/20 flex justify-between items-end">
            <span className="text-xs uppercase tracking-widest text-cream/70">Total</span>
            <span className="font-display text-3xl text-mustard">{formatCOP(total)}</span>
          </div>
          <Button onClick={() => navigate("/checkout")} className="w-full mt-6 bg-mustard hover:bg-mustard-deep text-brown-ink press-shadow" size="lg">
            Continuar al checkout
          </Button>
        </aside>
      </div>
    </div>
  );
}
