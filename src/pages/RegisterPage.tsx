import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { z } from "zod";

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "Costa Rica",
    city: "",
    details: "",
  });
  const [loading, setLoading] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t("auth.errNameShort")).max(80),
        email: z.string().trim().email(t("auth.errEmailInvalid")).max(120),
        password: z.string().min(6, t("auth.errPasswordShort")).max(80),
        phone: z
          .string()
          .trim()
          .min(7, t("auth.errPhoneInvalid"))
          .max(20, t("auth.errPhoneLong"))
          .regex(/^[+\d\s\-()]+$/, t("auth.errPhoneChars")),
        country: z.string().trim().min(2, t("auth.errCountryRequired")).max(60),
        city: z.string().trim().min(2, t("auth.errCityRequired")).max(60),
        details: z.string().trim().min(5, t("checkout.invalidAddress")).max(200),
      }),
    [t]
  );

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    try {
      await register(parsed.data.name, parsed.data.email, parsed.data.password, {
        phone: parsed.data.phone,
        address: {
          country: parsed.data.country,
          city: parsed.data.city,
          details: parsed.data.details,
        },
      });
      toast.success(t("auth.accountCreated"));
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || t("auth.registerError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-20 max-w-xl">
      <div className="text-center mb-8">
        <Disc3 className="h-12 w-12 mx-auto text-burnt animate-spin-slow" strokeWidth={1.2} />
        <h1 className="mt-4 font-display text-4xl text-brown-ink">{t("auth.createAccountTitle")}</h1>
        <p className="mt-2 font-serif-body italic text-muted-foreground">
          {t("auth.registerSubtitle")}
        </p>
      </div>

      <form onSubmit={submit} className="bg-card border border-brown-ink/10 p-8 space-y-5 vinyl-shadow">
        <div>
          <Label>{t("auth.fullName")}</Label>
          <Input value={form.name} onChange={set("name")} maxLength={80} required />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>{t("common.email")}</Label>
            <Input type="email" value={form.email} onChange={set("email")} maxLength={120} required />
          </div>
          <div>
            <Label>{t("common.password")}</Label>
            <Input type="password" value={form.password} onChange={set("password")} maxLength={80} required />
          </div>
        </div>

        <div>
          <Label>{t("auth.phone")}</Label>
          <Input
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            maxLength={20}
            placeholder="+506 1234 5678"
            required
          />
        </div>

        <div className="pt-4 border-t border-brown-ink/15 space-y-4">
          <h2 className="font-display text-xl text-brown-ink">{t("auth.addressTitle")}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t("common.country")}</Label>
              <Input value={form.country} onChange={set("country")} maxLength={60} required />
            </div>
            <div>
              <Label>{t("common.city")}</Label>
              <Input value={form.city} onChange={set("city")} maxLength={60} required />
            </div>
          </div>
          <div>
            <Label>{t("auth.addressDetails")}</Label>
            <Input
              value={form.details}
              onChange={set("details")}
              maxLength={200}
              placeholder="Cra 10 # 20-30, apto 401"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-burnt hover:bg-burnt-deep press-shadow" size="lg">
          {loading ? t("auth.creating") : t("auth.createAccountBtn")}
        </Button>
      </form>

      <p className="text-center text-sm mt-6 text-muted-foreground">
        {t("auth.haveAccount")}{" "}
        <Link to="/login" className="text-burnt-deep font-semibold hover:underline">{t("auth.loginLink")}</Link>
      </p>
    </div>
  );
}
