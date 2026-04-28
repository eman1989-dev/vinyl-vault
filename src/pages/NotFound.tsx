import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: ruta no encontrada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="container py-32 text-center">
      <Disc3 className="h-24 w-24 mx-auto text-burnt/40 animate-spin-slow" strokeWidth={1} />
      <p className="mt-6 text-xs uppercase tracking-[0.25em] text-burnt">Side C · Track 04</p>
      <h1 className="mt-3 font-display text-7xl text-brown-ink">404</h1>
      <p className="mt-4 font-serif-body italic text-xl text-muted-foreground">
        Esta canción no está en nuestro catálogo.
      </p>
      <Button asChild className="mt-8 bg-burnt hover:bg-burnt-deep press-shadow">
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  );
};

export default NotFound;
