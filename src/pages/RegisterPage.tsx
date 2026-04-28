import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(80),
  email: z.string().trim().email("Correo inválido").max(120),
  password: z.string().min(6, "Mínimo 6 caracteres").max(80),
});

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Cuenta creada");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-20 max-w-md">
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
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} required />
        </div>
        <div>
          <Label>Correo</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={120} required />
        </div>
        <div>
          <Label>Contraseña</Label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} maxLength={80} required />
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
