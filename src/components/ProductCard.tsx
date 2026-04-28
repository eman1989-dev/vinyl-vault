import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { formatCOP } from "@/lib/format";
import { Disc3, Disc, Radio } from "lucide-react";

const formatIcon = {
  Vinyl: Disc3,
  CD: Disc,
  Cassette: Radio,
};

export default function ProductCard({ product }: { product: Product }) {
  const Icon = formatIcon[product.format];
  return (
    <Link
      to={`/producto/${product._id}`}
      className="group block bg-card border border-brown-ink/10 hover:border-burnt/40 transition-warm overflow-hidden vinyl-shadow hover:-translate-y-1 duration-300"
      style={{ transitionProperty: "transform, border-color, box-shadow" }}
    >
      <div className="relative aspect-square overflow-hidden bg-cream-deep">
        <img
          src={product.imageUrl}
          alt={`${product.title} — ${product.artist}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-cream text-brown-ink border border-brown-ink/20 flex items-center gap-1">
            <Icon className="h-3 w-3" /> {product.format}
          </span>
          {product.condition === "used" && (
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-mustard text-brown-ink">
              Usado
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-widest text-burnt font-semibold mb-1">{product.artist}</p>
        <h3 className="font-display text-lg leading-tight text-brown-ink line-clamp-1">
          {product.title}
        </h3>
        <p className="font-serif-body italic text-sm text-muted-foreground mt-0.5">
          {product.genre} {product.year && `· ${product.year}`}
        </p>
        <div className="mt-3 flex items-end justify-between">
          <span className="font-display text-xl text-brown-ink">{formatCOP(product.price)}</span>
          {product.stock > 0 ? (
            <span className="text-xs text-olive font-medium">En stock</span>
          ) : (
            <span className="text-xs text-destructive font-medium">Agotado</span>
          )}
        </div>
      </div>
    </Link>
  );
}
