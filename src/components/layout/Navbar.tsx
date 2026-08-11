import { Link, NavLink, useNavigate } from "react-router-dom";
import { Disc3, ShoppingBag, User as UserIcon, LogOut, ShieldCheck, Store, Moon, Sun, Sparkles, Languages } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, LANGUAGES, langName } from "@/context/LanguageContext";
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
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium tracking-wide uppercase transition-colors ${
      isActive ? "text-burnt-deep" : "text-brown-ink/70 hover:text-burnt"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-brown-ink/15 bg-cream/85 backdrop-blur-md dark:bg-background/90 dark:border-border/20">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <Disc3 className="h-7 w-7 text-burnt-deep group-hover:animate-spin-slow" strokeWidth={1.5} />
          <span className="font-display text-xl text-foreground leading-none">
            Vinyls<span className="text-burnt"> & </span>More
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>{t("nav.home")}</NavLink>
          <NavLink to="/catalogo" className={navLinkClass}>{t("nav.catalog")}</NavLink>
          <NavLink to="/segunda-mano" className={navLinkClass}>{t("nav.secondHand")}</NavLink>
          <NavLink to="/recomendaciones" className={navLinkClass}>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> {t("nav.recommendations")}
            </span>
          </NavLink>
          {user?.role === "seller" && (
            <NavLink to="/vendedor" className={navLinkClass}>{t("nav.myStore")}</NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={navLinkClass}>{t("nav.admin")}</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-mustard/20 gap-1.5" aria-label={t("nav.chooseLanguage")}>
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline text-xs uppercase font-semibold">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("nav.chooseLanguage")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LANGUAGES.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={l.code === lang ? "bg-mustard/20 font-semibold" : ""}
                >
                  {langName(l.code)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="text-foreground hover:bg-mustard/20" onClick={toggle} aria-label={t("nav.toggleTheme")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button asChild variant="ghost" size="sm" className="relative text-foreground hover:bg-mustard/20">
            <Link to="/carrito" aria-label={t("nav.cart")}>
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
                <Button variant="ghost" size="sm" className="text-foreground hover:bg-mustard/20 gap-2">
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
                  <ShoppingBag className="h-4 w-4 mr-2" /> {t("nav.myOrders")}
                </DropdownMenuItem>
                {user.role === "seller" && (
                  <DropdownMenuItem onClick={() => navigate("/vendedor")}>
                    <Store className="h-4 w-4 mr-2" /> {t("nav.myStore")}
                  </DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <ShieldCheck className="h-4 w-4 mr-2" /> {t("nav.adminPanel")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="h-4 w-4 mr-2" /> {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" variant="default" className="bg-burnt hover:bg-burnt-deep">
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
