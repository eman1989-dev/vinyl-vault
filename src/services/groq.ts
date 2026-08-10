// Capa de servicios para la API de Groq (recomendaciones musicales con IA).
// La clave se lee de VITE_GROQ_API_KEY (entorno) o, si no existe, de localStorage.

export type GroqRole = "system" | "user" | "assistant";

export interface GroqMessage {
  role: GroqRole;
  content: string;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const STORAGE_KEY = "vm_groq_api_key";
const STORAGE_MODEL = "vm_groq_model";

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

export const GROQ_MODELS: { id: string; label: string }[] = [
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B (Recomendado)" },
  { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B (Rápido)" },
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
];

export function getGroqApiKey(): string {
  const envKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined) || "";
  if (envKey.trim()) return envKey.trim();
  return (localStorage.getItem(STORAGE_KEY) || "").trim();
}

export function setGroqApiKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key.trim());
}

export function hasGroqApiKey(): boolean {
  return getGroqApiKey().length > 0;
}

export function getGroqModel(): string {
  const saved = localStorage.getItem(STORAGE_MODEL);
  if (saved && GROQ_MODELS.some((m) => m.id === saved)) return saved;
  return (import.meta.env.VITE_GROQ_MODEL as string | undefined) || DEFAULT_GROQ_MODEL;
}

export function setGroqModel(model: string) {
  localStorage.setItem(STORAGE_MODEL, model);
}

export async function groqChat(
  messages: GroqMessage[],
  opts: { model?: string; temperature?: number } = {}
): Promise<string> {
  const key = getGroqApiKey();
  if (!key) throw new Error("Falta la clave de API de Groq.");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: opts.model || getGroqModel(),
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.error?.message || JSON.stringify(data);
    } catch {
      detail = await res.text();
    }
    throw new Error(`Groq ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Respuesta vacía de Groq.");
  return content.trim();
}
