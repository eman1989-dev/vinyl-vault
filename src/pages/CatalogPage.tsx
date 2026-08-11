import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { productsApi, secondHandApi } from "@/services/api";
import type { Condition, Format, Product } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const FORMATS: Format[] = ["Vinyl", "CD", "Cassette"];
const CONDITIONS: Condition[] = ["new", "used"];

export default function CatalogPage() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvedSecondHandIds, setApprovedSecondHandIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState(params.get("q") || "");
  const [formats, setFormats] = useState<Format[]>(
    (params.get("format")?.split(",").filter(Boolean) as Format[]) || []
  );
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    productsApi.list().then((p) => { setProducts(p); setLoading(false); });
    secondHandApi
      .listAll()
      .then((subs) =>
        setApprovedSecondHandIds(new Set(subs.filter((s) => s.approved).map((s) => s.productId)))
      )
      .catch(() => setApprovedSecondHandIds(new Set()));
  }, []);

  const visible = useMemo(
    () => products.filter((p) => !(p.isSecondHand && !approvedSecondHandIds.has(p._id))),
    [products, approvedSecondHandIds]
  );

  const allGenres = useMemo(
    () => Array.from(new Set(visible.map((p) => p.genre))).sort(),
    [visible]
  );

  const filtered = useMemo(() => {
    return visible.filter((p) => {
      if (formats.length && !formats.includes(p.format as Format)) return false;
      if (conditions.length && !conditions.includes(p.condition as Condition)) return false;
      if (genres.length && !genres.includes(p.genre)) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.artist.toLowerCase().includes(q) &&
          !p.genre.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [visible, formats, conditions, genres, query]);

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const clearAll = () => {
    setFormats([]); setConditions([]); setGenres([]); setQuery("");
    setParams({});
  };

  return (
    <div className="container py-12">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-burnt mb-2">{t("catalog.title")}</p>
        <h1 className="font-display text-5xl text-brown-ink">{t("catalog.heading")}</h1>
        <p className="mt-3 text-muted-foreground font-serif-body italic max-w-2xl">
          {filtered.length === 1
            ? t("catalog.resultsOne", { count: filtered.length })
            : t("catalog.resultsMany", { count: filtered.length })}
        </p>
      </header>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Filtros */}
        <aside className="space-y-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("catalog.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-card border-brown-ink/20"
            />
          </div>

          <FilterGroup title={t("common.format")}>
            {FORMATS.map((f) => (
              <CheckRow
                key={f} label={f}
                checked={formats.includes(f)}
                onChange={() => setFormats(toggle(formats, f))}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={t("common.condition")}>
            {CONDITIONS.map((c) => (
              <CheckRow
                key={c} label={c === "new" ? t("common.new") : t("common.used")}
                checked={conditions.includes(c)}
                onChange={() => setConditions(toggle(conditions, c))}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={t("common.genre")}>
            {allGenres.map((g) => (
              <CheckRow
                key={g} label={g}
                checked={genres.includes(g)}
                onChange={() => setGenres(toggle(genres, g))}
              />
            ))}
          </FilterGroup>

          <Button variant="outline" onClick={clearAll} className="w-full border-brown-ink/30">
            <SlidersHorizontal className="h-4 w-4 mr-2" /> {t("catalog.clearFilters")}
          </Button>
        </aside>

        {/* Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-cream-deep animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-brown-ink/20">
              <p className="font-display text-2xl text-brown-ink">{t("catalog.nothingHere")}</p>
              <p className="text-muted-foreground mt-2 font-serif-body italic">
                {t("catalog.emptySubtitle")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-sm uppercase tracking-widest text-brown-ink mb-3 pb-2 border-b border-brown-ink/15">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <Label className="flex items-center gap-2 cursor-pointer text-sm text-brown-ink/80 hover:text-brown-ink">
      <Checkbox checked={checked} onCheckedChange={onChange} className="border-brown-ink/40 data-[state=checked]:bg-burnt data-[state=checked]:border-burnt" />
      {label}
    </Label>
  );
}
