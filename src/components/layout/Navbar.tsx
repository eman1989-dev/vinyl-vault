import { Link, NavLink, useNavigate } from "react-router-dom";
import { Disc3, ShoppingBag, User as UserIcon, LogOut, ShieldCheck, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium tracking-wide uppercase transition-colors ${
      isActive ? "text-burnt-deep" : "text-brown-ink/70 hover:text-burnt"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-brown-ink/15 bg-cream/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <Disc3 className="h-7 w-7 text-burnt-deep group-hover:animate-spin-slow" strokeWidth={1.5} />
          <span className="font-display text-xl text-brown-ink leading-none">
            Vinyls<span className="text-burnt"> & </span>More
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>Inicio</NavLink>
          <NavLink to="/catalogo" className={navLinkClass}>Catálogo</NavLink>
          <NavLink to="/segunda-mano" className={navLinkClass}>Segunda mano</NavLink>
          {user?.role === "seller" && (
            <NavLink to="/vendedor" className={navLinkClass}>Mi tienda</NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="relative text-brown-ink hover:bg-mustard/20">
            <Link to="/carrito" aria-label="Carrito">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-burnt text-primary-foreground text-xs flex items-center justify-center font-semibold">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-brown-ink hover:bg-mustard/20 gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/mis-pedidos")}>
                  <ShoppingBag className="h-4 w-4 mr-2" /> Mis pedidos
                </DropdownMenuItem>
                {user.role === "seller" && (
                  <DropdownMenuItem onClick={() => navigate("/vendedor")}>
                    <Store className="h-4 w-4 mr-2" /> Mi tienda
                  </DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <ShieldCheck className="h-4 w-4 mr-2" /> Panel admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Salir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" variant="default" className="bg-burnt hover:bg-burnt-deep">
              <Link to="/login">Ingresar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
