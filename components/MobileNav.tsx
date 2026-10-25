"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Activity, Sparkles, BarChart3, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_SNAPPY } from "@/lib/motion";

const MOBILE_DOCK_TABS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Scores", href: "/scores", icon: Activity },
  { label: "Arena", href: "/fantasy", icon: Sparkles },
  { label: "Pitch", href: "/analytics", icon: BarChart3 },
  { label: "Pavilion", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 block md:hidden pointer-events-none">
      <nav
        aria-label="Mobile Floating Dock"
        className="pointer-events-auto mx-auto max-w-md rounded-full glass-dock px-3 py-2 shadow-dock"
      >
        <div className="grid grid-cols-5 items-center gap-1">
          {MOBILE_DOCK_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 rounded-full py-2 text-xs transition-colors z-10",
                  isActive
                    ? "text-stadium-navy font-semibold"
                    : "text-ivory-muted hover:text-ivory"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-dock-sliding-pill"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 -z-10 rounded-full bg-accent-gold shadow-turf-glow"
                  />
                )}
                <Icon className="h-4 w-4" />
                <span className="text-[9px] uppercase tracking-[0.12em]">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}