import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Sketch2Code",
  description: "Turn whiteboard algorithms into readable code, critiques, and reusable study canvases.",
  metadataBase: new URL("https://sketchcode.vercel.app")
};

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap"
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap"
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasClerkProvider = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY &&
      process.env.DISABLE_AUTH !== "true"
  );
  const content = (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <body className={`${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-body antialiased`}>
        <ThemeProvider>
          <div className="ambient-backdrop" />
          <div className="grain-overlay" />
          <Navbar hasClerk={hasClerkProvider} />
          <main className="relative z-10 pt-[84px]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );

  if (!hasClerkProvider) {
    return content;
  }

  return (
    <ClerkProvider>
      {content}
    </ClerkProvider>
  );
}
