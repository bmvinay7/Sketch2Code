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
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 bg-[#08111f]/60 backdrop-blur-[12px] border-b border-border-nav">
      <Link href="/" className="font-display text-xl font-normal text-text-primary tracking-tight">
        Sketch2Code
      </Link>
      
      <div className="hidden md:flex gap-10 items-center">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href.split("/")[1] ? `/${link.href.split("/")[1]}` : link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-body text-[0.9rem] font-normal transition-colors",
                isActive 
                  ? "text-text-primary before:content-['●_'] before:text-[0.5rem] before:align-middle before:mr-1" 
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        {hasClerk ? (
          <>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/50 rounded-btn text-text-primary font-body text-[0.95rem] hover:bg-white/20 hover:border-white/70 transition-all whitespace-nowrap">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </>
        ) : (
          <Link href="/sign-in" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/50 rounded-btn text-text-primary font-body text-[0.95rem] hover:bg-white/20 hover:border-white/70 transition-all whitespace-nowrap">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
