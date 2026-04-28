import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { productsApi, reviewsApi } from "@/services/api";
import type { Product, Review } from "@/types";
import { formatCOP, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qty, setQty] = useState(1);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const { add } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    productsApi.get(id).then((p) => setProduct(p ?? null));
    reviewsApi.listByProduct(id).then(setReviews);
  }, [id]);

  if (!product) return <div className="container py-20">Cargando…</div>;

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const handleAdd = () => {
    add(product, qty);
    toast.success(`${product.title} añadido al carrito`);
  };

  const submitReview = async () => {
    if (!user) return navigate("/login");
    if (!comment.trim()) return;
    const newR = await reviewsApi.create({
      userId: user._id,
      productId: product._id,
      rating,
      comment,
    });
    setReviews((prev) => [...prev, newR]);
    setComment("");
    toast.success("Reseña publicada");
  };

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-cream-deep border border-brown-ink/10 vinyl-shadow">
          <div className="aspect-square overflow-hidden">
            <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-burnt mb-2">{product.format} · {product.year}</p>
          <h1 className="font-display text-5xl text-brown-ink leading-tight">{product.title}</h1>
          <p className="mt-2 font-serif-body italic text-2xl text-brown-ink/80">{product.artist}</p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className={`h-4 w-4 ${i <= avg ? "fill-mustard text-mustard" : "text-muted-foreground"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>{product.genre}</Badge>
            <Badge variant={product.condition === "new" ? "olive" : "mustard"}>
              {product.condition === "new" ? "Nuevo" : "Usado"}
            </Badge>
            {product.isSecondHand && <Badge variant="burnt">Segunda mano</Badge>}
          </div>

          <p className="mt-6 text-brown-ink/80 font-serif-body leading-relaxed">{product.description}</p>

          <div className="mt-8 pt-6 border-t border-brown-ink/15">
            <div className="font-display text-4xl text-brown-ink">{formatCOP(product.price)}</div>
            <p className="text-sm text-olive mt-1">
              {product.stock > 0 ? `${product.stock} unidades disponibles` : "Agotado"}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-brown-ink/30">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-mustard/20" aria-label="Restar">
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 font-medium w-12 text-center">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3 hover:bg-mustard/20" aria-label="Sumar">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              size="lg"
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="flex-1 bg-burnt hover:bg-burnt-deep press-shadow"
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> Añadir al carrito
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 max-w-3xl">
        <h2 className="font-display text-3xl text-brown-ink mb-6">Reseñas</h2>

        <div className="space-y-6 mb-10">
          {reviews.length === 0 && (
            <p className="text-muted-foreground font-serif-body italic">Aún no hay reseñas. Sé el primero.</p>
          )}
          {reviews.map((r) => (
            <article key={r._id} className="bg-card border border-brown-ink/10 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-brown-ink">{r.userName ?? "Usuario"}</p>
                  <div className="flex">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-mustard text-mustard" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
              </div>
              <p className="mt-3 text-brown-ink/80 font-serif-body">{r.comment}</p>
            </article>
          ))}
        </div>

        {user ? (
          <div className="bg-card border border-brown-ink/10 p-6">
            <h3 className="font-display text-xl mb-3">Escribe tu reseña</h3>
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map((i) => (
                <button key={i} onClick={() => setRating(i)} aria-label={`${i} estrellas`}>
                  <Star className={`h-6 w-6 ${i <= rating ? "fill-mustard text-mustard" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos qué te pareció…"
              maxLength={500}
              className="bg-background"
            />
            <Button onClick={submitReview} className="mt-3 bg-burnt hover:bg-burnt-deep">Publicar</Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-brown-ink/20 p-6 text-center">
            <p className="font-serif-body italic">Inicia sesión para dejar una reseña.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "mustard" | "olive" | "burnt";
}) {
  const styles = {
    default: "bg-cream-deep text-brown-ink border border-brown-ink/20",
    mustard: "bg-mustard text-brown-ink",
    olive: "bg-olive text-cream",
    burnt: "bg-burnt text-cream",
  } as const;
  return (
    <span className={`inline-flex px-3 py-1 text-xs uppercase tracking-wider font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}
