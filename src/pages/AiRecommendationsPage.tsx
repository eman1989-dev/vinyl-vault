import { useEffect, useRef, useState } from "react";
import { Bot, Music, Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GROQ_MODELS,
  getGroqModel,
  groqChat,
  hasGroqApiKey,
  setGroqModel,
  type GroqMessage,
} from "@/services/groq";
import { productsApi } from "@/services/api";
import type { Product } from "@/types";
import { formatCOP } from "@/lib/format";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Recomiéndame álbumes esenciales de jazz en vinilo",
  "Discos para empezar a escuchar rock progresivo",
  "Álbumes perfectos para escuchar de noche",
  "Bandas que suenan como Radiohead",
];

const buildSystemPrompt = (catalog: string | null) => `
Eres "Vinyl Advisor", el curador musical de Vinyls & More, una tienda costarricense especializada en vinilos, CDs y cassettes. Tu trabajo es recomendar música con pasión y conocimiento de coleccionista.

Normas:
- Responde siempre en español, con tono cálido y cercano.
- Recomienda álbumes, artistas y formatos concretos, explicando en una frase por qué vale la pena cada uno.
- Si el catálogo de la tienda está disponible, prioriza esos discos cuando encajen con lo que pide la persona; usa precios en colones.
- Adapta tus sugerencias al género, presupuesto o ánimo que pida la persona.
- Ofrece entre 4 y 8 recomendaciones por mensaje; sé jugoso pero conciso.
- Si no conoces un dato, dilo con honestidad en lugar de inventar.
${catalog ? `\nCatálogo actual de Vinyls & More:\n${catalog}` : ""}
`.trim();

const buildCatalog = (products: Product[]) =>
  products
    .slice(0, 60)
    .map(
      (p) =>
        `- ${p.title} — ${p.artist} (${p.genre}, ${p.format}${
          p.year ? `, ${p.year}` : ""
        }, ${formatCOP(p.price)})`
    )
    .join("\n");

export default function AiRecommendationsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<string | null>(null);
  const [model, setModel] = useState(() => getGroqModel());
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    productsApi
      .list()
      .then((all) => setCatalog(buildCatalog(all)))
      .catch(() => setCatalog(null));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    if (!hasGroqApiKey()) {
      setError(
        "No hay clave de Groq configurada. Añade VITE_GROQ_API_KEY en tu archivo .env."
      );
      return;
    }

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setError(null);

    const apiMessages: GroqMessage[] = [
      { role: "system", content: buildSystemPrompt(catalog) },
      ...updated.slice(-12).map((m) => ({ role: m.role, content: m.content })),
    ];

    try {
      const reply = await groqChat(apiMessages, { model });
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: reply },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar con la IA.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="container py-12 max-w-4xl">
      <header className="mb-8 text-center">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-burnt mb-3">
          <Sparkles className="h-3.5 w-3.5" /> Recomendador con IA
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-brown-ink">
          Pregúntale a <span className="italic text-burnt">Vinyl Advisor</span>
        </h1>
        <p className="mt-3 font-serif-body italic text-muted-foreground max-w-xl mx-auto">
          Cuéntale qué música te gusta o qué estás buscando y te recomendará discos,
          artistas y formatos, priorizando lo que hay en nuestra tienda.
        </p>
      </header>

      <div className="bg-card border border-brown-ink/10 vinyl-shadow overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-brown-ink/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-burnt" />
            <span className="text-sm font-semibold uppercase tracking-widest text-brown-ink">
              Vinyl Advisor
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={model}
              onValueChange={(v) => {
                setModel(v);
                setGroqModel(v);
              }}
            >
              <SelectTrigger className="h-9 w-auto gap-2 text-xs bg-background border-brown-ink/20">
                <SelectValue placeholder="Modelo" />
              </SelectTrigger>
              <SelectContent>
                {GROQ_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={clearChat}
              disabled={messages.length === 0}
              aria-label="Limpiar conversación"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[28rem]">
          <div className="px-4 py-6 space-y-5">
            {messages.length === 0 ? (
              <div className="text-center py-14">
                <Music className="h-10 w-10 text-burnt/40 mx-auto mb-4" strokeWidth={1.2} />
                <p className="font-display text-2xl text-brown-ink">
                  ¿Qué disco deberías escuchar hoy?
                </p>
                <p className="mt-2 text-sm text-muted-foreground font-serif-body italic">
                  Pregúntame por género, artista, época o simplemente tu estado de ánimo.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-md bg-burnt px-4 py-3 text-primary-foreground"
                        : "max-w-[85%] rounded-md border border-brown-ink/10 bg-background px-4 py-3 text-foreground"
                    }
                  >
                    <RichText text={m.content} />
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-md border border-brown-ink/10 bg-background px-4 py-3 text-muted-foreground flex items-center gap-2">
                  <Disc3Spinner />
                  <span className="font-serif-body italic">Escribiendo una recomendación…</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-4 py-3">
                {error}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-brown-ink/10 px-4 py-4">
          {messages.length === 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-brown-ink/25 text-brown-ink/80 hover:bg-mustard/20 hover:border-burnt/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              rows={2}
              placeholder="Ej: Recomiéndame jazz para empezar…"
              value={input}
              maxLength={1000}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="min-h-[3.5rem] max-h-40 bg-background border-brown-ink/20 resize-y"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="h-[3.5rem] w-[3.5rem] shrink-0 bg-burnt hover:bg-burnt-deep press-shadow"
              aria-label="Enviar mensaje"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Vinyl Advisor puede equivocarse; verifica los datos antes de comprar.
          </p>
        </div>
      </div>
    </div>
  );
}

function Disc3Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin-slow text-burnt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="1.5" />
      <path d="M12 3a9 9 0 0 1 6.36 2.64" strokeLinecap="round" />
    </svg>
  );
}

function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (!para.length) return;
    blocks.push(
      <p key={`p-${blocks.length}`} className="mb-2 last:mb-0 leading-relaxed">
        {para.map((line, i) => (
          <span key={i}>
            {renderInline(line)}
            {i < para.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
    para = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (/^[-•*]\s+/.test(trimmed)) {
      flushPara();
      blocks.push(
        <div key={`li-${blocks.length}`} className="mb-1.5 flex gap-2 pl-1">
          <span className="text-burnt mt-0.5 shrink-0">♪</span>
          <span>{renderInline(trimmed.replace(/^[-•*]\s+/, ""))}</span>
        </div>
      );
    } else if (/^\d+[.)]\s+/.test(trimmed)) {
      flushPara();
      blocks.push(
        <div key={`li-${blocks.length}`} className="mb-1.5 flex gap-2 pl-1">
          <span className="text-burnt font-semibold mt-0.5 shrink-0">
            {trimmed.match(/^\d+/)?.[0]}.
          </span>
          <span>{renderInline(trimmed.replace(/^\d+[.)]\s+/, ""))}</span>
        </div>
      );
    } else if (trimmed === "") {
      flushPara();
    } else {
      para.push(line);
    }
  });
  flushPara();

  return <div>{blocks}</div>;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
