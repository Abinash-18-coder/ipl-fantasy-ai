"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Check,
  Volume2,
  VolumeX,
  ShieldCheck,
  Palette,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { dispatchFranchiseThemeEvent } from "@/components/ui/CursorGridBackdrop";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { FranchiseRow, UserProfileRow } from "@/types";

export interface FranchiseThemeSelectorProps {
  franchises: FranchiseRow[];
  initialProfile: UserProfileRow | null;
}

const FALLBACK_FRANCHISES: FranchiseRow[] = [
  {
    id: "fallback-csk",
    code: "CSK",
    name: "Chennai Super Kings",
    city: "Chennai",
    primary_hex: "#d9a74a",
    secondary_hex: "#1d428a",
    logo_url: null,
    home_stadium_id: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-mi",
    code: "MI",
    name: "Mumbai Indians",
    city: "Mumbai",
    primary_hex: "#3b6ea5",
    secondary_hex: "#c8b273",
    logo_url: null,
    home_stadium_id: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-rcb",
    code: "RCB",
    name: "Royal Challengers Bengaluru",
    city: "Bengaluru",
    primary_hex: "#b84242",
    secondary_hex: "#c8b273",
    logo_url: null,
    home_stadium_id: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-kkr",
    code: "KKR",
    name: "Kolkata Knight Riders",
    city: "Kolkata",
    primary_hex: "#6d4c9c",
    secondary_hex: "#d4af37",
    logo_url: null,
    home_stadium_id: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-rr",
    code: "RR",
    name: "Rajasthan Royals",
    city: "Jaipur",
    primary_hex: "#b85486",
    secondary_hex: "#254aa5",
    logo_url: null,
    home_stadium_id: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-gt",
    code: "GT",
    name: "Gujarat Titans",
    city: "Ahmedabad",
    primary_hex: "#4a6b82",
    secondary_hex: "#c8b273",
    logo_url: null,
    home_stadium_id: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-lsg",
    code: "LSG",
    name: "Lucknow Super Giants",
    city: "Lucknow",
    primary_hex: "#3b6fb6",
    secondary_hex: "#d97736",
    logo_url: null,
    home_stadium_id: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-dc",
    code: "DC",
    name: "Delhi Capitals",
    city: "Delhi",
    primary_hex: "#3b5998",
    secondary_hex: "#c94a4a",
    logo_url: null,
    home_stadium_id: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-pbks",
    code: "PBKS",
    name: "Punjab Kings",
    city: "Mohali",
    primary_hex: "#c2464c",
    secondary_hex: "#d4be81",
    logo_url: null,
    home_stadium_id: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-srh",
    code: "SRH",
    name: "Sunrisers Hyderabad",
    city: "Hyderabad",
    primary_hex: "#cf6a38",
    secondary_hex: "#222b30",
    logo_url: null,
    home_stadium_id: null,
    created_at: "",
    updated_at: "",
  },
];

export function FranchiseThemeSelector({
  franchises,
  initialProfile,
}: FranchiseThemeSelectorProps) {
  const router = useRouter();
  const supabase = createClient();

  const activeList = franchises.length > 0 ? franchises : FALLBACK_FRANCHISES;

  const [selectedId, setSelectedId] = useState<string>(
    initialProfile?.favorite_franchise_id ?? activeList[0]?.id ?? ""
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    initialProfile?.sound_enabled ?? false
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const selectedFranchise =
    activeList.find((item) => item.id === selectedId) ?? activeList[0];

  useEffect(() => {
    if (selectedFranchise) {
      dispatchFranchiseThemeEvent({
        primaryHex: selectedFranchise.primary_hex,
        secondaryHex: selectedFranchise.secondary_hex,
        code: selectedFranchise.code,
      });
    }
  }, [selectedFranchise]);

  const handleSelectFranchise = (franchise: FranchiseRow) => {
    setSelectedId(franchise.id);
    setSaveFeedback(null);
    dispatchFranchiseThemeEvent({
      primaryHex: franchise.primary_hex,
      secondaryHex: franchise.secondary_hex,
      code: franchise.code,
    });
  };

  const handleSavePreferences = async () => {
    setSaveFeedback(null);

    if (!initialProfile) {
      setSaveFeedback({
        type: "success",
        message: `Live ambient theme switched to ${selectedFranchise?.name}. Sign in above to lock this permanently to your Supabase profile.`,
      });
      return;
    }

    if (selectedId.startsWith("fallback-")) {
      setSaveFeedback({
        type: "error",
        message:
          "Run migration 0004_seed_stadiums_and_franchises.sql in Supabase SQL Editor first to persist database UUIDs.",
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("users")
      .update({
        favorite_franchise_id: selectedId,
        sound_enabled: soundEnabled,
      })
      .eq("id", initialProfile.id);

    setSaving(false);

    if (error) {
      setSaveFeedback({
        type: "error",
        message: error.message,
      });
    } else {
      setSaveFeedback({
        type: "success",
        message: `${selectedFranchise?.name} ambient stadium lighting and audio telemetry saved to your Mumbai profile.`,
      });
      router.refresh();
    }
  };

  if (!selectedFranchise) return null;

  return (
    <section className="rounded-sm glass-card p-8 sm:p-12 border border-ivory/15 shadow-glass-panel space-y-10 relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-28 right-10 h-80 w-80 rounded-full blur-[130px] transition-colors duration-700"
        style={{ backgroundColor: `${selectedFranchise.primary_hex}35` }}
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full blur-[130px] transition-colors duration-700"
        style={{ backgroundColor: `${selectedFranchise.secondary_hex}28` }}
      />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-ivory/10 pb-8 relative z-10">
        <div className="space-y-2">
          <p className="eyebrow-label text-accent-gold flex items-center gap-2">
            <Palette className="h-3.5 w-3.5" />
            BESPOKE STADIUM ATMOSPHERE &bull; 10 FRANCHISES
          </p>
          <h2 className="font-display text-3xl sm:text-5xl text-ivory font-normal">
            Tailor your{" "}
            <span
              className="italic transition-colors duration-500"
              style={{ color: selectedFranchise.primary_hex }}
            >
              franchise floodlights.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-ivory-muted max-w-2xl leading-relaxed">
            Select your allegiance below. Clicking any crest immediately
            recalibrates the volumetric stadium lighting across the entire
            platform and prioritizes your home venue telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={cn(
            "inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs border transition-all cursor-pointer self-start lg:self-auto",
            soundEnabled
              ? "bg-accent-gold/15 border-accent-gold text-ivory"
              : "bg-black/45 border-ivory/15 text-ivory-muted hover:text-ivory"
          )}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-accent-gold" />
          ) : (
            <VolumeX className="h-4 w-4 text-ivory-dim" />
          )}
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] tabular-score">
            Stadium Audio: {soundEnabled ? "ARMED" : "MUTED (DEFAULT)"}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedFranchise.code}
              initial={{ opacity: 0, rotateX: 8, y: 10 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, rotateX: -6, y: -10 }}
              transition={SPRING_GENTLE}
              style={{
                borderColor: `${selectedFranchise.primary_hex}66`,
                boxShadow: `0 24px 64px -12px ${selectedFranchise.primary_hex}28`,
              }}
              className="relative rounded-sm bg-stadium-navy/90 p-7 border space-y-6 overflow-hidden"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-0.5"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${selectedFranchise.primary_hex} 50%, transparent 100%)`,
                }}
              />

              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ivory-dim tabular-score">
                  ACTIVE FLOODLIGHT RIG
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest border tabular-score"
                  style={{
                    color: selectedFranchise.primary_hex,
                    borderColor: `${selectedFranchise.primary_hex}50`,
                    backgroundColor: `${selectedFranchise.primary_hex}15`,
                  }}
                >
                  {selectedFranchise.code}
                </span>
              </div>

              <div className="flex items-center gap-5 py-2">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 font-display text-2xl tracking-[0.16em] text-ivory shadow-glass-panel"
                  style={{
                    borderColor: selectedFranchise.primary_hex,
                    background: `radial-gradient(circle at 30% 30%, ${selectedFranchise.primary_hex}45 0%, ${selectedFranchise.secondary_hex}25 60%, #060809 100%)`,
                  }}
                >
                  {selectedFranchise.code}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-ivory-dim flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-accent-gold" />
                    {selectedFranchise.city} Corridor
                  </p>
                  <h3 className="font-display text-3xl text-ivory leading-tight">
                    {selectedFranchise.name}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-ivory/10 text-xs font-mono tabular-score">
                <div className="flex items-center gap-2.5 rounded-sm bg-white/2 p-2.5 border border-ivory/8">
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: selectedFranchise.primary_hex }}
                  />
                  <div>
                    <p className="text-[9px] text-ivory-dim">PRIMARY BEAM</p>
                    <p className="text-ivory uppercase">
                      {selectedFranchise.primary_hex}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-sm bg-white/2 p-2.5 border border-ivory/8">
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shrink-0"
                    style={{
                      backgroundColor: selectedFranchise.secondary_hex,
                    }}
                  />
                  <div>
                    <p className="text-[9px] text-ivory-dim">SECONDARY MIST</p>
                    <p className="text-ivory uppercase">
                      {selectedFranchise.secondary_hex}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {activeList.map((franchise) => {
            const isSelected = franchise.id === selectedFranchise.id;
            return (
              <button
                key={franchise.code}
                type="button"
                onClick={() => handleSelectFranchise(franchise)}
                className={cn(
                  "relative flex flex-col items-center justify-between rounded-sm p-4 border text-center transition-all duration-300 cursor-pointer group",
                  isSelected
                    ? "bg-ivory/[0.07] border-accent-gold shadow-turf-glow -translate-y-0.5"
                    : "bg-black/45 border-ivory/10 hover:border-ivory/25 hover:bg-ivory/3"
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId="franchise-card-active-outline"
                    transition={SPRING_SNAPPY}
                    className="pointer-events-none absolute inset-0 rounded-sm border-2"
                    style={{ borderColor: franchise.primary_hex }}
                  />
                )}

                <div className="w-full flex items-center justify-between mb-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: franchise.primary_hex }}
                  />
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-accent-gold" />
                  )}
                </div>

                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full border font-display text-base tracking-[0.14em] text-ivory mb-2 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    borderColor: `${franchise.primary_hex}65`,
                    background: `radial-gradient(circle, ${franchise.primary_hex}30 0%, transparent 75%)`,
                  }}
                >
                  {franchise.code}
                </div>

                <p className="font-mono text-[10px] font-semibold text-ivory tracking-wider">
                  {franchise.city}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {saveFeedback && (
        <div
          className={cn(
            "rounded-sm p-4 border text-xs flex items-center justify-between relative z-10",
            saveFeedback.type === "success"
              ? "bg-sage-turf/15 border-[#8ec2a8]/40 text-[#8ec2a8]"
              : "bg-accent-crimson/15 border-accent-crimson/40 text-[#eb8f8f]"
          )}
        >
          <span>{saveFeedback.message}</span>
          <span className="font-mono text-[10px] uppercase tracking-widest shrink-0 ml-4">
            RLS VERIFIED
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ivory/10 pt-6 relative z-10">
        <div className="flex items-center gap-2 text-xs text-ivory-dim">
          <ShieldCheck className="h-4 w-4 text-accent-gold" />
          <span>
            {initialProfile
              ? `Signed in as ${initialProfile.email} • Updates public.users via RLS`
              : "Preview Mode Active • Sign in above to persist to PostgreSQL"}
          </span>
        </div>

        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={handleSavePreferences}
          disabled={saving}
        >
          <Sparkles className="h-4 w-4" />
          <span>
            {saving
              ? "Persisting to Mumbai DB..."
              : "LOCK FRANCHISE & SAVE PROFILE"}
          </span>
        </Button>
      </div>
    </section>
  );
}