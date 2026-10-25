// File: app/layout.tsx
import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { getServerEnv } from "@/lib/env";

// Enforce Zod environment validation at server boot time (Day 5)
const env = getServerEnv();

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "CricIntel AI | IPL 30-Team Fantasy Generator & Live Scorecards",
    template: "%s | CricIntel AI",
  },
  description:
    "AI-powered IPL Fantasy Cricket platform built on Next.js 16.3.8, Gemini 3.8 Flash (1M Context), HiGHS WASM Solver, T-24h provisional lineups, and T-30m toss auto-swaps.",
};

export const viewport: Viewport = {
  themeColor: "#0a0f1d",
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
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans bg-stadium-navy text-slate-100 antialiased selection:bg-pitch-turf selection:text-slate-950`}
      >
        <div className="relative flex min-h-screen flex-col pb-24 md:pb-8">
          <Navbar />
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}