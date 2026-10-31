import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { CursorGridBackdrop } from "@/components/ui/CursorGridBackdrop";

export const metadata: Metadata = {
  title: {
    default: "CRICINTEL | IPL AI Fantasy & Pitch Intelligence",
    template: "%s | CRICINTEL",
  },
  description:
    "Next.js 16.3.8 & Gemini 3.8 Flash IPL Fantasy Intelligence Platform: Live Cricket Scorecards, Pitch & Dew Aerodynamics, and 20-Team Combinatorial Lineup Optimization.",
  keywords: [
    "IPL Fantasy AI",
    "Cricket Live Scores",
    "Dream11 Lineup Optimizer",
    "Pitch Report",
    "Dew Factor",
    "Gemini 3.8 Flash",
  ],
};

export const viewport: Viewport = {
  themeColor: "#060809",
  width: "device-width",
  initialScale: 1,
};

const FONT_VARIABLES_STYLE: React.CSSProperties = {
  ["--font-sans" as string]:
    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  ["--font-display" as string]:
    "'Cormorant Garamond', Georgia, Cambria, 'Times New Roman', serif",
  ["--font-mono" as string]:
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      style={FONT_VARIABLES_STYLE}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-stadium-950 text-ivory antialiased selection:bg-accent-gold/25 selection:text-ivory overflow-x-hidden flex flex-col">
        <CursorGridBackdrop />
        <Navbar />
        <main className="relative z-10 flex-1 pb-24 md:pb-12">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}