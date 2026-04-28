import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { secondHandApi, productsApi } from "@/services/api";
import type { SecondHandSubmission, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, PlusCircle } from "lucide-react";
import { formatDate } from "@/lib/format";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<(SecondHandSubmission & { product?: Product })[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([secondHandApi.listBySeller(user._id), productsApi.list()]).then(([subs, products]) => {
      setSubmissions(subs.map((s) => ({ ...s, product: products.find((p) => p._id === s.productId) })));
    });
  }, [user]);

  return (
    <div className="container py-12">
      <header className="flex flex-wrap justify-between gap-4 items-end mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-burnt mb-2">Vendedor</p>
          <h1 className="font-display text-5xl text-brown-ink">Mi tienda</h1>
        </div>
        <Button asChild className="bg-burnt hover:bg-burnt-deep press-shadow">
          <Link to="/vendedor/publicar"><PlusCircle className="h-4 w-4 mr-2" />Publicar artículo</Link>
        </Button>
      </header>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <Stat label="Publicaciones" value={submissions.length} />
        <Stat label="Aprobadas" value={submissions.filter((s) => s.approved).length} />
        <Stat label="Pendientes" value={submissions.filter((s) => !s.approved).length} />
      </div>

      <h2 className="font-display text-2xl text-brown-ink mb-4">Mis publicaciones</h2>
      {submissions.length === 0 ? (
        <p className="text-muted-foreground italic">Aún no has publicado nada.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <article key={s._id} className="bg-card border border-brown-ink/10 p-4 flex gap-4 items-center">
              <img src={s.realImages[0] || s.product?.images[0]} alt="" className="w-16 h-16 object-cover bg-cream-deep" />
              <div className="flex-1">
                <p className="font-display text-lg text-brown-ink">{s.product?.title ?? "Artículo"}</p>
                <p className="text-sm text-muted-foreground italic">{s.conditionDetails}</p>
              </div>
              <div className="text-right">
                {s.approved ? (
                  <span className="inline-flex items-center gap-1 text-xs text-olive font-semibold uppercase">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Aprobado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-mustard-deep font-semibold uppercase">
                    <Clock className="h-3.5 w-3.5" /> En revisión
                  </span>
                )}
                <p className="text-xs text-muted-foreground mt-1">{formatDate(s.createdAt)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-brown-ink/10 p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-4xl text-brown-ink mt-1">{value}</p>
    </div>
  );
}
