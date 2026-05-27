import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 border border-rule-strong bg-transparent px-5 font-mono text-[12px] uppercase tracking-cap text-paper-50 transition-colors hover:bg-paper-50 hover:text-ink-0 disabled:cursor-not-allowed disabled:border-rule disabled:text-paper-300 disabled:hover:bg-transparent disabled:hover:text-paper-300",
        className
      )}
      {...props}
    />
  );
}
