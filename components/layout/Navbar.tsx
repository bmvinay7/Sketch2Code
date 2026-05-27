"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/canvas/new", label: "canvas", index: "01" },
  { href: "/community", label: "library", index: "02" }
];

export function Navbar() {
  const pathname = usePathname();
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-rule bg-ink-0/85 backdrop-blur-[10px]">
      <div className="mx-auto flex h-full max-w-[1480px] items-center justify-between px-6 lg:px-10">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-mono text-[13px] font-bold tracking-tightest text-paper-50">sketch2code</span>
          <span className="index-tag hidden sm:inline">v0.1</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const segment = link.href.split("/")[1];
            const isActive = pathname.startsWith(`/${segment}`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-baseline gap-2 font-mono text-[12px] uppercase tracking-cap transition-colors",
                  isActive ? "text-paper-50" : "text-paper-200 hover:text-paper-50"
                )}
              >
                <span className={cn("tabular text-[10px]", isActive ? "text-lime" : "text-paper-300")}>
                  {link.index}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {hasClerk ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="inline-flex h-9 items-center gap-2 border border-rule-strong bg-transparent px-4 font-mono text-[11px] uppercase tracking-cap text-paper-50 transition-colors hover:bg-paper-50 hover:text-ink-0">
                    sign in
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-7 w-7 rounded-none border border-rule-strong"
                    }
                  }}
                />
              </SignedIn>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex h-9 items-center gap-2 border border-rule-strong bg-transparent px-4 font-mono text-[11px] uppercase tracking-cap text-paper-50 transition-colors hover:bg-paper-50 hover:text-ink-0"
            >
              sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
