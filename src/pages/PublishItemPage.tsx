import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { productsApi, secondHandApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

export default function PublishItemPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", artist: "", genre: "", format: "Vinyl" as const,
    year: "", price: "", description: "",
    conditionDetails: "", imageUrl: "",
  });

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(2).max(120),
        artist: z.string().trim().min(2).max(120),
        genre: z.string().trim().min(2).max(60),
        format: z.enum(["Vinyl", "CD", "Cassette"]),
        year: z.number().int().min(1900).max(2100).optional(),
        price: z.number().positive(),
        description: z.string().max(500).optional(),
        conditionDetails: z.string().trim().min(5, t("publish.describeCondition")).max(300),
        imageUrl: z.string().url(t("publish.invalidImageUrl")),
      }),
    [t]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      ...form,
      year: form.year ? Number(form.year) : undefined,
      price: Number(form.price),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    try {
      const product = await productsApi.create({
        title: parsed.data.title,
        artist: parsed.data.artist,
        genre: parsed.data.genre,
        format: parsed.data.format,
        year: parsed.data.year,
        condition: "used",
        price: parsed.data.price,
        stock: 1,
        description: parsed.data.description,
        images: [parsed.data.imageUrl],
        sellerId: user._id,
        isSecondHand: true,
      });
      await secondHandApi.create({
        productId: product._id,
        sellerId: user._id,
        conditionDetails: parsed.data.conditionDetails,
        realImages: [parsed.data.imageUrl],
      });
      toast.success(t("publish.sentForReview"));
      navigate("/vendedor");
    } catch {
      toast.error(t("publish.publishError"));
    } finally { setLoading(false); }
  };

  return (
    <div className="container py-12 max-w-2xl">
      <p className="text-xs uppercase tracking-[0.25em] text-burnt mb-2">{t("publish.newPublication")}</p>
      <h1 className="font-display text-4xl text-brown-ink mb-8">{t("publish.title")}</h1>

      <form onSubmit={submit} className="space-y-5 bg-card border border-brown-ink/10 p-5 sm:p-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>{t("publish.titleAlbum")}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} required /></div>
          <div><Label>{t("common.artist")}</Label><Input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} maxLength={120} required /></div>
          <div><Label>{t("common.genre")}</Label><Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} maxLength={60} required /></div>
          <div>
            <Label>{t("common.format")}</Label>
            <Select value={form.format} onValueChange={(v: any) => setForm({ ...form, format: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Vinyl">Vinyl</SelectItem>
                <SelectItem value="CD">CD</SelectItem>
                <SelectItem value="Cassette">Cassette</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>{t("common.year")}</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} min={1900} max={2100} /></div>
          <div><Label>{t("publish.priceCop")}</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min={0} required /></div>
        </div>

        <div>
          <Label>{t("publish.realImageUrl")}</Label>
          <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" required />
          <p className="text-xs text-muted-foreground mt-1 italic">{t("publish.imageHint")}</p>
        </div>

        <div>
          <Label>{t("common.description")}</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} rows={3} />
        </div>

        <div>
          <Label>{t("publish.conditionDetails")}</Label>
          <Textarea value={form.conditionDetails} onChange={(e) => setForm({ ...form, conditionDetails: e.target.value })} maxLength={300} rows={3} placeholder={t("publish.conditionPlaceholder")} required />
        </div>

        <Button type="submit" disabled={loading} size="lg" className="w-full bg-burnt hover:bg-burnt-deep press-shadow">
          {loading ? t("publish.publishing") : t("common.submitForReview")}
        </Button>
        <p className="text-xs text-muted-foreground italic text-center">
          {t("publish.reviewNote")}
        </p>
      </form>
    </div>
  );
}
