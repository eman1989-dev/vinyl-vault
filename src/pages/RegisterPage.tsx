import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import type { UserRole } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(80),
  email: z.string().trim().email("Correo inválido").max(120),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Teléfono inválido")
    .max(20, "Teléfono muy largo")
    .regex(/^[+\d\s\-()]+$/, "Solo dígitos y + - ( )"),
  country: z.string().trim().min(2, "País requerido").max(60),
  city: z.string().trim().min(2, "Ciudad requerida").max(60),
  details: z.string().trim().min(5, "Indica una dirección válida").max(200),
  role: z.enum(["user", "seller", "admin"]),
});

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "Colombia",
    city: "",
    details: "",
    role: "user" as UserRole,
  });
  const [loading, setLoading] = useState(false);

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
        role: parsed.data.role,
      });
      toast.success("Cuenta creada");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-20 max-w-xl">
      <div className="text-center mb-8">
        <Disc3 className="h-12 w-12 mx-auto text-burnt animate-spin-slow" strokeWidth={1.2} />
        <h1 className="mt-4 font-display text-4xl text-brown-ink">Crea tu cuenta</h1>
        <p className="mt-2 font-serif-body italic text-muted-foreground">
          Únete a la comunidad de coleccionistas.
        </p>
      </div>

      <form onSubmit={submit} className="bg-card border border-brown-ink/10 p-8 space-y-5 vinyl-shadow">
        <div>
          <Label>Nombre completo</Label>
          <Input value={form.name} onChange={set("name")} maxLength={80} required />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Correo electrónico</Label>
            <Input type="email" value={form.email} onChange={set("email")} maxLength={120} required />
          </div>
          <div>
            <Label>Contraseña</Label>
            <Input type="password" value={form.password} onChange={set("password")} maxLength={80} required />
          </div>
        </div>

        <div>
          <Label>Número de teléfono</Label>
          <Input
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            maxLength={20}
            placeholder="+57 300 123 4567"
            required
          />
        </div>

        <div>
          <Label>Tipo de cuenta</Label>
          <Select value={form.role} onValueChange={(v: UserRole) => setForm({ ...form, role: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Comprador</SelectItem>
              <SelectItem value="seller">Vendedor</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1 italic">
            Demo: en producción el rol admin debería asignarse manualmente desde el backend.
          </p>
        </div>

        <div className="pt-4 border-t border-brown-ink/15 space-y-4">
          <h2 className="font-display text-xl text-brown-ink">Dirección</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>País</Label>
              <Input value={form.country} onChange={set("country")} maxLength={60} required />
            </div>
            <div>
              <Label>Ciudad</Label>
              <Input value={form.city} onChange={set("city")} maxLength={60} required />
            </div>
          </div>
          <div>
            <Label>Detalles (calle, número, apto)</Label>
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
          {loading ? "Creando…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-center text-sm mt-6 text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-burnt-deep font-semibold hover:underline">Ingresa</Link>
      </p>
    </div>
  );
}
