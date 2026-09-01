import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { formatSkuPrice } from "@/lib/skus";

export function Shell({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to="/" className="font-display text-lg tracking-tight text-fg">
            {BRAND.name}
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              to="/market"
              className="hidden rounded-md px-3 py-2 text-muted hover:text-fg sm:inline"
            >
              {t("navIndex")}
            </Link>
            <Link
              to="/check"
              className="hidden rounded-md px-3 py-2 text-muted hover:text-fg sm:inline"
            >
              {t("navCheck")}
            </Link>
            <div className="flex rounded-md bg-surface-2 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded px-2 py-1 ${lang === "en" ? "bg-surface text-fg" : "text-muted"}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("sv")}
                className={`rounded px-2 py-1 ${lang === "sv" ? "bg-surface text-fg" : "text-muted"}`}
              >
                SV
              </button>
            </div>
            <a
              href="/#go"
              className="ml-1 hidden h-9 items-center rounded-md bg-accent px-3 text-xs font-medium text-accent-fg sm:inline-flex"
            >
              {t("navCta")} · {formatSkuPrice("report", lang)}
            </a>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-5">{children}</div>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs text-subtle">
          <p>{t("footerLine")}</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms" className="hover:text-fg">
              {t("terms")}
            </Link>
            <Link to="/privacy" className="hover:text-fg">
              {t("privacy")}
            </Link>
            <Link to="/refund" className="hover:text-fg">
              {t("refunds")}
            </Link>
            <Link to="/contact" className="hover:text-fg">
              {t("contact")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
