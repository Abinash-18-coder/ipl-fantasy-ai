
import React from "react";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { CursorGridBackdrop } from "@/components/ui/CursorGridBackdrop";
import { getServerEnv } from "@/lib/env";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const env = getServerEnv();

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "CricIntel — Bespoke IPL Fantasy Intelligence & Live Match Club",
    template: "%s | CricIntel",
  },
  description:
    "A calm, bespoke IPL fantasy intelligence pavilion powered by Gemini 3.8 Flash High Deep Research and deterministic HiGHS optimization.",
};

export const viewport: Viewport = {
  themeColor: "#060809",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${cormorantGaramond.variable} ${plusJakartaSans.variable}`}
    >
      <body className="font-sans bg-stadium-navy text-ivory antialiased selection:bg-accent-gold selection:text-stadium-navy">
        <CursorGridBackdrop />
        <div className="relative flex min-h-screen flex-col pb-24 md:pb-12">
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
