"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Blocks, Github, UsersRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/canvas/new", label: "Workspace" },
  { href: "/community", label: "Community", icon: UsersRound },
];

export function Navbar() {
  const pathname = usePathname();
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const isLanding = pathname === "/";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between gap-3 px-[clamp(24px,5vw,60px)]">
        {/* ─── Logo ─── */}
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
            <Blocks className="h-4 w-4 text-[color:var(--color-accent)]" strokeWidth={1.5} />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold leading-4 text-[color:var(--color-text-primary)]">Sketch2Code</span>
            <span className="hidden font-mono text-[10px] font-semibold uppercase leading-4 tracking-[0.06em] text-[color:var(--color-text-secondary)] sm:block">
              Visual algorithm intelligence
            </span>
          </span>
        </Link>

        {/* ─── Nav links ─── */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => {
            const segment = link.href.split("/")[1];
            const isActive = pathname.startsWith(segment ? `/${segment}` : link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-[color:var(--color-text-primary)] opacity-70 transition-opacity duration-150 hover:opacity-100",
                  isActive && "opacity-100"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ─── Right actions ─── */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* GitHub badge — ghost button */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-10 items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 text-sm font-semibold text-[color:var(--color-text-primary)] hover:border-[color:var(--color-text-primary)] hover:bg-[rgba(0,0,0,0.03)] sm:inline-flex"
          >
            <Github className="h-4 w-4" strokeWidth={1.5} />
            Star on GitHub
          </a>

          {/* Primary CTA — changes contextually */}
          {isLanding ? (
            <Link
              href="/canvas/new"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-5 text-sm font-semibold text-[color:var(--color-text-on-dark)] transition-all duration-150 hover:-translate-y-px hover:bg-[color:var(--color-accent-hover)]"
            >
              Get started
            </Link>
          ) : (
            hasClerk ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="inline-flex h-10 items-center rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-5 text-sm font-semibold text-[color:var(--color-text-on-dark)] transition-all duration-150 hover:-translate-y-px hover:bg-[color:var(--color-accent-hover)]">
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-1">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex h-10 items-center rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-5 text-sm font-semibold text-[color:var(--color-text-on-dark)] transition-all duration-150 hover:-translate-y-px hover:bg-[color:var(--color-accent-hover)]"
              >
                Sign in
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
