import { useEffect, useMemo, useState } from "react";
import { ordersApi, productsApi, secondHandApi, usersApi } from "@/services/api";
import type { Format, Order, OrderStatus, Product, SecondHandSubmission, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, Plus, Search, Trash2 } from "lucide-react";
import { formatCOP, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().trim().min(2, "Título requerido").max(120),
  artist: z.string().trim().min(1, "Artista requerido").max(120),
  genre: z.string().trim().min(2, "Género requerido").max(60),
  format: z.enum(["Vinyl", "CD", "Cassette"]),
  year: z.number().int().min(1900).max(2100).optional(),
  price: z.number().positive("Precio inválido"),
  stock: z.number().int().min(0, "Stock inválido"),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url("URL inválida"),
});

const emptyProduct = {
  title: "",
  artist: "",
  genre: "",
  format: "Vinyl" as Format,
  year: "",
  price: "",
  stock: "1",
  description: "",
  imageUrl: "",
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<SecondHandSubmission[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [creating, setCreating] = useState(false);

  const refresh = () => {
    productsApi.list().then(setProducts);
    ordersApi.listAll().then(setOrders);
    usersApi.listAll().then(setUsers);
    secondHandApi.listAll().then(setSubmissions);
  };

  useEffect(refresh, []);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, userQuery]);

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await ordersApi.updateStatus(id, status);
    refresh();
    toast.success("Estado actualizado");
  };

  const removeProduct = async (id: string) => {
    await productsApi.remove(id);
    refresh();
    toast.success("Producto eliminado");
  };

  const approveSubmission = async (id: string) => {
    await secondHandApi.approve(id);
    refresh();
    toast.success("Publicación aprobada");
  };

  const rejectSubmission = async (id: string) => {
    await secondHandApi.delete(id);
    refresh();
    toast.success("Publicación eliminada");
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = productSchema.safeParse({
      ...newProduct,
      year: newProduct.year ? Number(newProduct.year) : undefined,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
    });

    if (!parsed.success) {
      return toast.error(parsed.error.issues[0].message);
    }

    setCreating(true);

    try {
      await productsApi.create({
        title: parsed.data.title,
        artist: parsed.data.artist,
        genre: parsed.data.genre,
        format: parsed.data.format,
        year: parsed.data.year,
        condition: "new",
        price: parsed.data.price,
        stock: parsed.data.stock,
        description: parsed.data.description,
        images: [parsed.data.imageUrl], // 👈 clave para backend
        isSecondHand: false,
      });

      setNewProduct(emptyProduct);
      refresh();
      toast.success("Producto agregado al catálogo");
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el producto");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-burnt mb-2">
        Administración
      </p>
      <h1 className="font-display text-5xl text-brown-ink mb-2">
        Panel de control
      </h1>

      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        <Stat label="Productos" value={products.length} />
        <Stat label="Pedidos" value={orders.length} />
        <Stat label="Usuarios" value={users.length} />
        <Stat
          label="Pend. revisión"
          value={submissions.filter((s) => !s.approved).length}
          highlight
        />
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="bg-cream-deep">
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="new-product">Nuevo producto</TabsTrigger>
          <TabsTrigger value="submissions">Segunda mano</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        {/* ================= PEDIDOS ================= */}
        <TabsContent value="orders" className="mt-6 space-y-3">
          {orders.length === 0 && (
            <p className="text-muted-foreground italic">No hay pedidos todavía.</p>
          )}
          {orders.map((o) => {
            const customer = users.find((u) => u._id === o.userId);
            return (
              <article key={o._id} className="bg-card border border-brown-ink/10 p-5">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <p className="font-semibold text-brown-ink">#{o._id.slice(-6)}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</p>
                    {customer && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {customer.name} · {customer.email}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl text-brown-ink">{formatCOP(o.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.shippingAddress.city}{o.shippingAddress.country ? `, ${o.shippingAddress.country}` : ""}
                    </p>
                  </div>
                  <Select value={o.status} onValueChange={(v: OrderStatus) => updateOrderStatus(o._id, v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ul className="mt-4 pt-4 border-t border-brown-ink/10 space-y-1.5">
                  {o.items.map((it) => (
                    <li key={it.productId} className="flex justify-between gap-3 text-sm">
                      <span className="truncate">
                        {it.title} <span className="text-muted-foreground">x{it.quantity}</span>
                      </span>
                      <span className="shrink-0">{formatCOP(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </TabsContent>

        {/* ================= PRODUCTOS ================= */}
        <TabsContent value="products" className="mt-6 space-y-2">
          {products.map((p) => (
            <article key={p._id} className="bg-card border p-3 flex items-center gap-4">
              <img
                src={p.imageUrl || "/placeholder.png"}
                alt=""
                className="w-12 h-12 object-cover"
              />
              <div className="flex-1">
                <p>{p.title}</p>
                <p className="text-xs">{p.artist}</p>
              </div>
              <p>{formatCOP(p.price)}</p>
              <Button onClick={() => removeProduct(p._id)}>
                <Trash2 />
              </Button>
            </article>
          ))}
        </TabsContent>

        {/* ================= NUEVO PRODUCTO ================= */}
        <TabsContent value="new-product" className="mt-6">
          <form onSubmit={createProduct} className="space-y-4 max-w-2xl">
            <Input placeholder="Título" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} />
            <Input placeholder="Artista" value={newProduct.artist} onChange={(e) => setNewProduct({ ...newProduct, artist: e.target.value })} />
            <Input placeholder="Género" value={newProduct.genre} onChange={(e) => setNewProduct({ ...newProduct, genre: e.target.value })} />

            <div className="grid grid-cols-2 gap-4">
              <Input type="number" placeholder="Precio (CRC)" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
              <Input type="number" placeholder="Stock" min={0} value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
            </div>

            <Input placeholder="URL Imagen" value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} />

            <Button type="submit" disabled={creating}>
              <Plus /> {creating ? "Creando..." : "Crear producto"}
            </Button>
          </form>
        </TabsContent>

        {/* ================= SEGUNDA MANO ================= */}
        <TabsContent value="submissions" className="mt-6 space-y-3">
          {submissions.length === 0 ? (
            <p className="text-muted-foreground italic">No hay publicaciones de segunda mano.</p>
          ) : (
            [...submissions]
              .sort((a, b) => Number(a.approved) - Number(b.approved))
              .map((s) => {
                const product = products.find((p) => p._id === s.productId);
                return (
                  <article key={s._id} className="bg-card border border-brown-ink/10 p-4 flex flex-wrap gap-4 items-center">
                    <img
                      src={s.realImages[0] || product?.imageUrl || product?.images?.[0]}
                      alt=""
                      className="w-16 h-16 object-cover bg-cream-deep"
                    />
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-semibold text-brown-ink">
                        {product ? `${product.title} — ${product.artist}` : "Artículo sin producto"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product
                          ? `${product.format} · ${product.genre} · ${formatCOP(product.price)}`
                          : `Producto ID: ${s.productId}`}
                      </p>
                      <p className="text-sm italic text-brown-ink/70 mt-1">{s.conditionDetails}</p>
                    </div>
                    <div className="text-right">
                      {s.approved ? (
                        <span className="inline-flex items-center gap-1 text-xs text-olive font-semibold uppercase">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aprobado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-mustard-deep font-semibold uppercase">
                          <Clock className="h-3.5 w-3.5" /> Pendiente de revisión
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(s.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={s.approved}
                        onClick={() => approveSubmission(s._id)}
                        className="bg-olive hover:bg-olive/80 disabled:opacity-40"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => rejectSubmission(s._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </article>
                );
              })
          )}
        </TabsContent>

        {/* ================= USERS ================= */}
          <TabsContent value="users" className="mt-6 space-y-2">
            <div className="relative max-w-md mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, correo o rol…"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="pl-9 bg-card border-brown-ink/20"
              />
            </div>

            {filteredUsers.length === 0 ? (
              <p className="text-muted-foreground italic">No se encontraron usuarios.</p>
            ) : (
              filteredUsers.map((u) => (
                <article key={u._id} className="bg-card border border-brown-ink/10 p-3 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-mustard text-brown-ink flex items-center justify-center font-semibold">
                    {u.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-brown-ink">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-brown-ink text-cream font-semibold">
                    {u.role}
                  </span>
                </article>
              ))
            )}
          </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, highlight }: any) {
  return (
    <div className={`p-4 border ${highlight ? "bg-mustard text-brown-ink" : ""}`}>
      <p>{label}</p>
      <p>{value}</p>
    </div>
  );
}
