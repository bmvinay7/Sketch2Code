import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Sketch2Code",
  description: "Draw flowcharts and stream faithful code generation for DSA learning.",
  metadataBase: new URL("https://sketchcode.lovable.app")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en">
      <body className="font-body antialiased">
        <div className="stars-overlay"></div>
        <Navbar />
        <main>{children}</main>
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
