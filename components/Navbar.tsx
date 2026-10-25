"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Sparkles,
  BarChart3,
  Settings,
  Search,
  Command,
  ArrowUpRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_SNAPPY, SPRING_GENTLE } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Live Scores",
    href: "/scores",
    shortcut: "01",
    description: "Ball-by-ball scorecards, run-rate telemetry & match center",
    requiresAuth: false,
  },
  {
    label: "Fantasy Arena",
    href: "/fantasy",
    shortcut: "02",
    description: "20 curated AI lineups — T-24h research & T-30m toss swap",
    requiresAuth: true,
  },
  {
    label: "Pitch & Matchups",
    href: "/analytics",
    shortcut: "03",
    description: "Venue aerodynamics, evening dew index & H2H micro-battles",
    requiresAuth: false,
  },
  {
    label: "The Pavilion",
    href: "/settings",
    shortcut: "04",
    description: "Member authentication & franchise ambient lighting",
    requiresAuth: true,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
      } else if (event.key === "Escape") {
        setPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return NAV_ITEMS;
    return NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const renderNavIcon = (href: string) => {
    switch (href) {
      case "/scores":
        return <Activity className="h-4 w-4 text-accent-gold" />;
      case "/fantasy":
        return <Sparkles className="h-4 w-4 text-accent-gold" />;
      case "/analytics":
        return <BarChart3 className="h-4 w-4 text-accent-gold" />;
      default:
        return <Settings className="h-4 w-4 text-accent-gold" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-navbar">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-12">
          <Link
            href="/"
            className="font-display text-lg sm:text-xl tracking-[0.28em] uppercase text-ivory hover:text-accent-gold transition-colors focus:outline-none"
          >
            CRICINTEL
          </Link>

          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-9"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-2 text-[13px] tracking-[0.06em] transition-colors duration-300",
                    isActive
                      ? "text-ivory font-medium"
                      : "text-ivory-muted hover:text-ivory"
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="desktop-navbar-sliding-pill"
                      transition={SPRING_SNAPPY}
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent-gold"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open Command Palette"
              className="flex items-center gap-2 rounded-full border border-ivory/15 bg-ivory/3 px-3.5 py-1.5 text-xs text-ivory-muted hover:border-ivory/30 hover:text-ivory transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-accent-gold" />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 font-mono text-[10px] tracking-wider text-ivory-muted">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            <Button asChild variant="ivory" size="sm" className="px-5">
              <Link href="/settings">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {paletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaletteOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command Palette"
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={SPRING_GENTLE}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl glass-dock shadow-dock border border-ivory/15"
            >
              <div className="flex items-center border-b border-ivory/10 px-5 py-4">
                <Search className="h-4 w-4 text-accent-gold mr-3 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Jump to a chapter (Scores, Fantasy Arena, Pitch, Pavilion)..."
                  className="w-full bg-transparent text-sm text-ivory placeholder-ivory-dim focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPaletteOpen(false)}
                  aria-label="Close Command Palette"
                  className="ml-2 rounded-md p-1 text-ivory-muted hover:text-ivory cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2.5 space-y-1">
                {filteredItems.length === 0 ? (
                  <p className="py-8 text-center text-xs text-ivory-dim">
                    No matching chapters found.
                  </p>
                ) : (
                  filteredItems.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        setPaletteOpen(false);
                        setSearchQuery("");
                        router.push(item.href);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left hover:bg-ivory/6 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs text-accent-gold/80 tabular-score">
                          {item.shortcut}
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ivory/4 border border-ivory/10">
                          {renderNavIcon(item.href)}
                        </div>
                        <div>
                          <div className="font-display text-lg text-ivory group-hover:text-accent-gold transition-colors">
                            {item.label}
                          </div>
                          <p className="text-xs text-ivory-muted">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-ivory-dim group-hover:text-accent-gold transition-colors" />
                    </button>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between border-t border-ivory/10 bg-black/40 px-5 py-2.5 text-[11px] text-ivory-dim">
                <span className="uppercase tracking-[0.18em]">ESC to close</span>
                <span className="tabular-score uppercase tracking-[0.18em]">
                  Mumbai Edge &bull; Gemini 3.8 High
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}