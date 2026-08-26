import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted shadow-[var(--shadow-border)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
