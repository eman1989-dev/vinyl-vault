import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ordersApi } from "@/services/api";
import { formatCOP } from "@/lib/format";
import { toast } from "sonner";
import { z } from "zod";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ country: "Costa Rica", city: "", details: "" });

  const schema = useMemo(
    () =>
      z.object({
        country: z.string().trim().min(2, t("checkout.required")).max(60),
        city: z.string().trim().min(2, t("checkout.required")).max(60),
        details: z.string().trim().min(5, t("checkout.invalidAddress")).max(200),
      }),
    [t]
  );

  if (!user) { navigate("/login"); return null; }
  if (items.length === 0) { navigate("/carrito"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const order = await ordersApi.create({
        userId: user._id,
        items: items.map((i) => ({
          productId: i.productId,
          title: i.product?.title || "",
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: total,
        shippingAddress: parsed.data,
      });
      clear();
      toast.success(t("checkout.toastConfirmed"));
      navigate(`/mis-pedidos?nuevo=${order._id}`);
    } catch (e) {
      toast.error(t("checkout.toastFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="font-display text-5xl text-brown-ink mb-10">{t("checkout.title")}</h1>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-6 bg-card border border-brown-ink/10 p-8">
          <h2 className="font-display text-2xl">{t("checkout.shippingAddress")}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t("common.country")}</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} maxLength={60} />
            </div>
            <div>
              <Label>{t("common.city")}</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={60} required />
            </div>
          </div>
          <div>
            <Label>{t("checkout.addressDetails")}</Label>
            <Input value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} maxLength={200} required />
          </div>

          <div className="pt-4 border-t border-brown-ink/15">
            <h3 className="font-display text-xl mb-3">{t("checkout.payment")}</h3>
            <p className="text-sm text-muted-foreground italic">
              {t("checkout.demoNote", { status: t("checkout.demoStatus") })}
            </p>
          </div>
        </div>

        <aside className="bg-brown-ink text-cream p-8 h-fit vinyl-shadow">
          <h2 className="font-display text-2xl mb-6">{t("checkout.yourOrder")}</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="truncate">{i.product?.title} <span className="text-cream/60">x{i.quantity}</span></span>
                <span>{formatCOP(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-6 border-t border-cream/20 flex justify-between items-end">
            <span className="text-xs uppercase tracking-widest text-cream/70">{t("common.total")}</span>
            <span className="font-display text-3xl text-mustard">{formatCOP(total)}</span>
          </div>
          <Button type="submit" disabled={submitting} className="w-full mt-6 bg-mustard hover:bg-mustard-deep text-brown-ink press-shadow" size="lg">
            {submitting ? t("checkout.processing") : t("checkout.confirmOrder")}
          </Button>
        </aside>
      </form>
    </div>
  );
}
