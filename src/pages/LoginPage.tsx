import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t("auth.welcomeToast"));
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-20 max-w-md">
      <div className="text-center mb-8">
        <Disc3 className="h-12 w-12 mx-auto text-burnt animate-spin-slow" strokeWidth={1.2} />
        <h1 className="mt-4 font-display text-4xl text-brown-ink">{t("auth.welcomeBack")}</h1>
        <p className="mt-2 font-serif-body italic text-muted-foreground">
          {t("auth.loginSubtitle")}
        </p>
      </div>

      <form onSubmit={submit} className="bg-card border border-brown-ink/10 p-8 space-y-5 vinyl-shadow">
        <div>
          <Label>{t("common.email")}</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={120} />
        </div>
        <div>
          <Label>{t("common.password")}</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required maxLength={80} />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-burnt hover:bg-burnt-deep press-shadow" size="lg">
          {loading ? t("auth.loggingIn") : t("nav.login")}
        </Button>

        <div className="text-xs text-muted-foreground bg-mustard/15 p-3 border border-mustard/40">
          <p className="font-semibold text-brown-ink mb-1">{t("auth.demoAccounts")}</p>
          <p>user@vinyls.com · admin@vinyls.com · seller@vinyls.com</p>
          <p className="italic">{t("auth.demoNote")}</p>
        </div>
      </form>

      <p className="text-center text-sm mt-6 text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link to="/registro" className="text-burnt-deep font-semibold hover:underline">{t("auth.signUp")}</Link>
      </p>
    </div>
  );
}
