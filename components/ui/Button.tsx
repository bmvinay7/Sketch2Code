import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "gradient-button rounded-lg bg-surface-raised px-4 py-2 text-sm font-semibold text-text-primary transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-45",
        className
      )}
      {...props}
    />
  );
}
