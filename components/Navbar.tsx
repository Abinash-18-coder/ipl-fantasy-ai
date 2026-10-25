// File: components/Navbar.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Activity,
  Sparkles,
  BarChart3,
  Settings,
  LogIn,
  Search,
  Command,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_SNAPPY, SPRING_GENTLE } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NavItem } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Live Scores",
    href: "/scores",
    shortcut: "G S",
    description: "Public Cricbuzz & CREX style live scorecards & ball tracker",
    requiresAuth: false,
    badgeText: "PUBLIC",
  },
  {
    label: "Fantasy Arena",
    href: "/fantasy",
    shortcut: "G F",
    description: "20 allocated AI lineups (T-24h provisional + T-30m toss swap)",
    requiresAuth: true,
    badgeText: "30 AI TEAMS",
  },
  {
    label: "Match Analytics",
    href: "/analytics",
    shortcut: "G A",
    description: "Pitch aerodynamics, Open-Meteo dew index & H2H matrix",
    requiresAuth: false,
  },
  {
    label: "User Settings",
    href: "/settings",
    shortcut: "G U",
    description: "Google OAuth login & favorite IPL franchise ambient theme",
    requiresAuth: true,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Listen globally for Ctrl+K (Windows/Linux) or Cmd+K (Mac) and Escape
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

  // Filter command palette items based on what the user types
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
        return <Activity className="h-4 w-4" />;
      case "/fantasy":
        return <Sparkles className="h-4 w-4 text-accent-gold" />;
      case "/analytics":
        return <BarChart3 className="h-4 w-4" />;
      case "/settings":
        return <Settings className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-navbar">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-turf-gradient shadow-turf-glow transition-transform duration-200 group-hover:scale-105">
              <Trophy className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  CRIC<span className="text-pitch-turf">INTEL</span>
                </span>
                <Badge variant="provisional" className="text-[10px] px-1.5 py-0">
                  v16.3.8
                </Badge>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Gemini 3.8 Flash &bull; HiGHS Solver
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Tabs with Motion layoutId Sliding Pill */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/70 p-1 border border-slate-800/80"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors z-10",
                    isActive
                      ? "text-pitch-turf"
                      : "text-slate-300 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="desktop-navbar-sliding-pill"
                      transition={SPRING_SNAPPY}
                      className="absolute inset-0 -z-10 rounded-lg bg-pitch-turf/15 border border-pitch-turf/35 shadow-turf-glow"
                    />
                  )}
                  {renderNavIcon(item.href)}
                  <span>{item.label}</span>
                  {item.badgeText && (
                    <span
                      className={cn(
                        "ml-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tabular-score",
                        item.href === "/fantasy"
                          ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30"
                          : "bg-slate-800 text-slate-400"
                      )}
                    >
                      {item.badgeText}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Cmd+K / Ctrl+K Trigger & Sign In Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open Command Palette"
              className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-pitch-turf" />
              <span className="hidden sm:inline">Quick Jump...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400 border border-slate-700">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            <Button asChild variant="default" size="sm">
              <Link href="/settings">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Cmd+K / Ctrl+K Spotlight Command Palette Modal */}
      <AnimatePresence>
        {paletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaletteOpen(false)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
            />

            {/* Modal Dialog Box */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command Palette"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={SPRING_GENTLE}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl glass-dock shadow-dock border border-slate-700/80"
            >
              <div className="flex items-center border-b border-slate-800 px-4 py-3">
                <Search className="h-4 w-4 text-pitch-turf mr-3 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a module name (Scores, Fantasy, Analytics, Settings)..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPaletteOpen(false)}
                  aria-label="Close Command Palette"
                  className="ml-2 rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filteredItems.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No matching stadium modules found.
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
                      className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left hover:bg-slate-800/80 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 group-hover:border-pitch-turf/40">
                          {renderNavIcon(item.href)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{item.label}</span>
                            {item.badgeText && (
                              <Badge
                                variant="outline"
                                className="text-[9px] py-0"
                              >
                                {item.badgeText}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-pitch-turf transition-colors" />
                    </button>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/60 px-4 py-2 text-[11px] text-slate-400">
                <span>Press ESC to close</span>
                <span className="tabular-score">Mumbai (bom1) Edge Active</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}