import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import es from "@/i18n/es";
import en from "@/i18n/en";
import pt from "@/i18n/pt";
import { setLocale } from "@/lib/format";
import type { Dict } from "@/i18n/es";

export type Language = "es" | "en" | "pt";

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
];

const dictionaries: Record<Language, Dict> = { es, en, pt };

type Vars = Record<string, string | number>;

interface LanguageCtx {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof Dict, vars?: Vars) => string;
}

const LanguageContext = createContext<LanguageCtx | undefined>(undefined);

const LOCALES: Record<Language, string> = {
  es: "es-CR",
  en: "en-US",
  pt: "pt-BR",
};

const langName = (l: Language): string =>
  l === "es" ? "Español" : l === "en" ? "English" : "Português";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("es");

  useEffect(() => {
    const stored = localStorage.getItem("vm_lang") as Language | null;
    const initial = stored && dictionaries[stored] ? stored : "es";
    setLangState(initial);
    document.documentElement.lang = initial;
    setLocale(LOCALES[initial]);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    try { localStorage.setItem("vm_lang", l); } catch (e) { /* storage no disponible */ }
    document.documentElement.lang = l;
    setLocale(LOCALES[l]);
  };

  const t = useCallback(
    (key: keyof Dict, vars?: Vars) => {
      let str = dictionaries[lang][key] ?? String(key);
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

export { langName };
