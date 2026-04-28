import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Disc3, Music, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-vinyl.jpg";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { productsApi } from "@/services/api";
import type { Product } from "@/types";

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    productsApi.list().then((all) => setFeatured(all.slice(0, 4)));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Tienda de vinilos vintage con luz cálida dorada"
            width={1600}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/80 to-cream/30" />
        </div>

        <div className="container py-24 md:py-36 grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-burnt-deep mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Desde 1998 · Bogotá
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-brown-ink leading-[0.95] text-balance">
              La música<br />
              <span className="italic text-burnt">como debe</span><br />
              escucharse.
            </h1>
            <p className="mt-6 text-lg text-brown-ink/75 font-serif-body max-w-md leading-relaxed">
              Vinilos, CDs y cassettes cuidadosamente seleccionados.
              Nuevos, usados y joyas de coleccionistas — todo en un solo lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-burnt hover:bg-burnt-deep press-shadow">
                <Link to="/catalogo">
                  Explorar catálogo <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-brown-ink/30 text-brown-ink hover:bg-mustard/30">
                <Link to="/segunda-mano">Ver segunda mano</Link>
              </Button>
            </div>

            <div className="mt-12 flex gap-8">
              {[
                { n: "2.4k+", l: "Discos" },
                { n: "150+", l: "Vendedores" },
                { n: "12k+", l: "Pedidos" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl text-brown-ink">{s.n}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex justify-center relative">
            <div className="relative">
              <div className="absolute -inset-8 bg-mustard/30 blur-3xl rounded-full" />
              <Disc3
                className="relative h-80 w-80 text-brown-ink/90 animate-spin-slow"
                strokeWidth={0.6}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FORMATOS */}
      <section className="container py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { f: "Vinyl", t: "Vinilos", d: "El sonido analógico que define generaciones." },
            { f: "CD", t: "CDs", d: "Calidad digital, ediciones especiales y rarezas." },
            { f: "Cassette", t: "Cassettes", d: "El renacer de un formato cargado de nostalgia." },
          ].map((c, i) => (
            <Link
              to={`/catalogo?format=${c.f}`}
              key={c.f}
              className="group p-8 bg-card border border-brown-ink/10 hover:bg-mustard/15 transition-warm"
              style={{ transitionDuration: "400ms" }}
            >
              <div className="text-6xl font-display text-burnt/30 group-hover:text-burnt transition-colors">
                0{i + 1}
              </div>
              <h3 className="mt-4 font-display text-2xl text-brown-ink">{c.t}</h3>
              <p className="mt-2 font-serif-body italic text-muted-foreground">{c.d}</p>
              <div className="mt-6 inline-flex items-center text-sm font-semibold text-burnt-deep">
                Explorar <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-burnt mb-2">Side B</p>
            <h2 className="font-display text-4xl md:text-5xl text-brown-ink">Destacados de la semana</h2>
          </div>
          <Link to="/catalogo" className="hidden md:inline-flex items-center text-sm font-semibold text-brown-ink hover:text-burnt">
            Ver todo <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* CTA SEGUNDA MANO */}
      <section className="container py-20">
        <div className="bg-brown-ink text-cream p-10 md:p-16 grid md:grid-cols-[1fr_auto] gap-8 items-center vinyl-shadow">
          <div>
            <p className="text-mustard text-xs uppercase tracking-[0.25em] mb-3 inline-flex items-center gap-2">
              <Music className="h-3.5 w-3.5" /> Para vendedores
            </p>
            <h2 className="font-display text-4xl md:text-5xl">¿Tienes discos guardados?</h2>
            <p className="mt-4 font-serif-body italic text-cream/80 max-w-xl">
              Dales una segunda vida. Publica tus vinilos, CDs y cassettes en
              nuestra sección de segunda mano y conecta con coleccionistas reales.
            </p>
          </div>
          <Button asChild size="lg" className="bg-mustard hover:bg-mustard-deep text-brown-ink press-shadow">
            <Link to="/vendedor/publicar">Publicar artículo</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
