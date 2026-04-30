import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-8 py-[0.875rem] bg-white/10 border border-white/45 rounded-btn text-text-primary font-body text-[0.95rem] hover:bg-white/20 hover:border-white/70 transition-all whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-45",
        className
      )}
      {...props}
    />
  );
}
