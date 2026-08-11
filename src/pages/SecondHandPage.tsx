import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { secondHandApi, productsApi } from "@/services/api";
import type { Product, SecondHandSubmission } from "@/types";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { CheckCircle2 } from "lucide-react";

export default function SecondHandPage() {
  const [items, setItems] = useState<(SecondHandSubmission & { product?: Product })[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    Promise.all([secondHandApi.listAll(), productsApi.list()]).then(([subs, products]) => {
      const enriched = subs
        .filter((s) => s.approved)
        .map((s) => ({ ...s, product: products.find((p) => p._id === s.productId) }))
        .filter((s) => !!s.product);
      setItems(enriched);
    });
  }, []);

  return (
    <div className="container py-12">
      <header className="mb-10 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-burnt mb-2">{t("secondHand.marketplace")}</p>
        <h1 className="font-display text-5xl text-brown-ink">{t("secondHand.title")}</h1>
        <p className="mt-3 font-serif-body italic text-brown-ink/70">
          {t("secondHand.intro")}
        </p>
        <Button asChild className="mt-6 bg-burnt hover:bg-burnt-deep press-shadow">
          <Link to="/vendedor/publicar">{t("secondHand.publishMyItem")}</Link>
        </Button>
      </header>

      {items.length === 0 ? (
        <p className="text-muted-foreground italic">{t("secondHand.noApproved")}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((s) => (
            <div key={s._id} className="relative">
              <ProductCard product={s.product!} />
              <div className="mt-2 flex items-center gap-1.5 text-xs text-olive">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="italic">{t("secondHand.soldBy", { name: s.sellerName ?? t("secondHand.verifiedSeller") })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
