"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowUpRight, Blocks, Library, PanelTop, UsersRound, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/canvas/new", label: "Workspace", icon: PanelTop },
  { href: "/community", label: "Community", icon: UsersRound }
];

export function Navbar() {
  const pathname = usePathname();
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--border-soft)] bg-[color:var(--surface-glass)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1680px] items-center justify-between gap-3 px-3 sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)]">
            <Blocks className="h-4 w-4 text-[color:var(--accent)]" />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold leading-4 text-[color:var(--text-primary)]">Sketch2Code</span>
            <span className="hidden text-[10px] font-semibold uppercase leading-4 text-[color:var(--text-muted)] sm:block">
              Visual algorithm intelligence
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] p-1 md:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const segment = link.href.split("/")[1];
            const isActive = pathname.startsWith(segment ? `/${segment}` : link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-[color:var(--surface-strong)] text-[color:var(--text-primary)]"
                    : "text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--text-primary)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/profile"
            aria-label="Open library"
            className="hidden h-10 items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-3 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-[color:var(--surface-hover)] sm:inline-flex"
          >
            <Library className="h-4 w-4 text-[color:var(--accent-2)]" />
            Library
          </Link>
          <Link
            href="/canvas/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[color:var(--accent)] px-3 text-sm font-semibold text-[color:var(--accent-contrast)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-accent)] sm:px-4"
          >
            <Zap className="h-4 w-4" />
            Open
            <ArrowUpRight className="hidden h-4 w-4 sm:block" />
          </Link>
          {hasClerk ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="hidden h-10 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-3 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-[color:var(--surface-hover)] sm:inline-flex sm:items-center">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-1">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </>
          ) : (
            <Link href="/sign-in" className="hidden h-10 items-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-3 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-[color:var(--surface-hover)] sm:inline-flex">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
