"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Code2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/canvas/new", label: "Canvas" },
  { href: "/community", label: "Community" }
];

export function Navbar() {
  const pathname = usePathname();
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-black text-white shadow-glow">
            S2C
          </span>
          <span className="hidden text-sm font-semibold tracking-wide text-text-primary sm:block">
            Sketch2Code
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-text-secondary transition hover:text-text-primary",
                pathname.startsWith(link.href.split("/")[1] ? `/${link.href.split("/")[1]}` : link.href) &&
                  "bg-surface-raised text-text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
          {hasClerk ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="gradient-button ml-2 rounded-lg bg-surface-raised px-4 py-2 text-sm font-medium text-text-primary">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="ml-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </>
          ) : (
            <Link href="/sign-in" className="gradient-button ml-2 rounded-lg bg-surface-raised px-4 py-2 text-sm font-medium text-text-primary">
              Sign in
            </Link>
          )}
          <Code2 className="hidden h-4 w-4 text-accent md:block" />
        </div>
      </nav>
    </header>
  );
}
