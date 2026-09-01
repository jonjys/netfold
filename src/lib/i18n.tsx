import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { COPY, type Lang, type CopyKey } from "@/lib/copy";

const STORAGE = "netfold_lang";

const LangContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: CopyKey) => string;
}>({
  lang: "sv",
  setLang: () => undefined,
  t: (key) => COPY.sv[key],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("sv");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE);
      if (stored === "sv" || stored === "en") setLangState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback((key: CopyKey) => COPY[lang][key] ?? COPY.sv[key], [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  return useContext(LangContext);
}
