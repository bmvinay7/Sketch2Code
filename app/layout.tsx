import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Sketch2Code",
  description: "Turn whiteboard algorithms into readable code, critiques, and reusable study canvases.",
  metadataBase: new URL("https://sketchcode.vercel.app")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="font-body antialiased">
        <ThemeProvider>
          <div className="ambient-backdrop" />
          <div className="grain-overlay" />
          <Navbar />
          <main className="relative z-10 pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return content;
  }

  return (
    <ClerkProvider>
      {content}
    </ClerkProvider>
  );
}
