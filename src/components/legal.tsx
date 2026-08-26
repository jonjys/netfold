import type { ReactNode } from "react";
import { Shell } from "@/components/shell";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Shell>
      <h1 className="font-display text-4xl tracking-tight">{title}</h1>
      <div className="mt-6 max-w-2xl space-y-4 text-sm leading-relaxed text-muted">{children}</div>
    </Shell>
  );
}
