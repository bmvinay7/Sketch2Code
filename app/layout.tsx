import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700", "800"],
  display: "swap"
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Sketch2Code — draw your algorithm, watch it become code",
  description: "A faithful flowchart-to-code workspace for DSA learners. Otsu-preprocessed sketches, streaming generation, honest analysis.",
  metadataBase: new URL("https://sketchcode.lovable.app")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = `${sans.variable} ${mono.variable} ${serif.variable}`;
  const content = (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Navbar />
        <main className="pt-[57px]">{children}</main>
      </body>
    </html>
  );

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return content;
  return <ClerkProvider>{content}</ClerkProvider>;
}
