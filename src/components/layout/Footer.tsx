import { Disc3, Mail, MapPin, Music2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-24 border-t border-brown-ink/15 bg-brown-ink text-cream">
      <div className="container py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <Disc3 className="h-7 w-7 text-mustard" strokeWidth={1.5} />
            <span className="font-display text-2xl">Vinyls & More</span>
          </Link>
          <p className="mt-4 text-cream/70 max-w-md font-serif-body italic leading-relaxed">
            {t("footer.tagline1")} {t("footer.tagline2")}
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg text-mustard mb-3">{t("footer.store")}</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link to="/catalogo" className="hover:text-mustard">{t("nav.catalog")}</Link></li>
            <li><Link to="/segunda-mano" className="hover:text-mustard">{t("nav.secondHand")}</Link></li>
            <li><Link to="/carrito" className="hover:text-mustard">{t("nav.cart")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-mustard mb-3">{t("footer.contact")}</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hola@vinylsmore.com</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {t("footer.address")}</li>
            <li className="flex items-center gap-2"><Music2 className="h-4 w-4" /> {t("footer.hours")}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container py-5 text-xs text-cream/50 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Vinyls & More. {t("footer.rights")}</span>
          <span className="font-serif-body italic">Side A · Track 01</span>
        </div>
      </div>
    </footer>
  );
}
