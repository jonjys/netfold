import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BRAND } from "@/lib/brand";

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <span className="rounded-md px-3 py-2 text-sm font-medium text-muted">
        Logga in
      </span>
    );
  }
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/mina-kop"
          className="hidden rounded-md px-3 py-2 text-sm text-muted hover:text-fg sm:inline"
        >
          Mina rapporter
        </Link>
        <UserButton />
      </div>
    );
  }
  return (
    <Link
      to="/login"
      search={{ next: "/" }}
      className="rounded-md px-3 py-2 text-sm font-medium text-fg hover:bg-surface-2"
    >
      Logga in
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to="/" className="font-display text-lg tracking-tight text-fg">
            {BRAND.name}
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              to="/market"
              className="hidden rounded-md px-3 py-2 text-muted hover:text-fg sm:inline"
            >
              Prisindex
            </Link>
            <Link
              to="/check"
              className="hidden rounded-md px-3 py-2 text-muted hover:text-fg sm:inline"
            >
              Kolla en ask
            </Link>
            <AuthSlot />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">{children}</div>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs text-subtle">
          <p>Netfold visar vad du får kvar, inte vad du ska be om.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms" className="hover:text-fg">
              Villkor
            </Link>
            <Link to="/privacy" className="hover:text-fg">
              Integritet
            </Link>
            <Link to="/refund" className="hover:text-fg">
              Återköp
            </Link>
            <Link to="/contact" className="hover:text-fg">
              Kontakt
            </Link>
            <Link to="/ops" className="hover:text-fg">
              Maskin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
