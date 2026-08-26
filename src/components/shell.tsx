import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="font-display text-lg tracking-tight text-fg">
            {BRAND.name}
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              to="/market"
              className="rounded-md px-3 py-2 text-muted hover:text-fg"
            >
              Index
            </Link>
            <Link
              to="/check"
              className="rounded-md px-3 py-2 text-muted hover:text-fg"
            >
              Check an ask
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">{children}</div>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs text-subtle">
          <p>Netfold prices the net, not the ask.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms" className="hover:text-fg">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-fg">
              Privacy
            </Link>
            <Link to="/refund" className="hover:text-fg">
              Refunds
            </Link>
            <Link to="/contact" className="hover:text-fg">
              Contact
            </Link>
            <Link to="/ops" className="hover:text-fg">
              Machine
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
