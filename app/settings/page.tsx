import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Lock,
  MailCheck,
  Database,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";
import { AuthSheet } from "@/components/auth/AuthSheet";
import { FranchiseThemeSelector } from "@/components/settings/FranchiseThemeSelector";
import { getMemberRlsSnapshot } from "@/lib/supabase/queries";

const PRIVACY_PILLARS = [
  {
    icon: Shield,
    title: "Zero Google Password Access",
    detail:
      "Google OAuth 2.0 authenticates directly on accounts.google.com. We only receive a verified identity token.",
  },
  {
    icon: Lock,
    title: "Irreversible bcrypt Hashing",
    detail:
      "Custom passwords are salted and hashed inside auth.users. Neither administrators nor developers can view them.",
  },
  {
    icon: MailCheck,
    title: "Mandatory Real-Inbox Proof",
    detail:
      "Unverified or random email addresses are blocked until the cryptographic link sent to that inbox is confirmed.",
  },
];

const RLS_PROTECTED_TABLES = [
  { table: "public.users", policy: "auth.uid() = id (Owner Only)" },
  {
    table: "public.user_team_allocations",
    policy: "auth.uid() = user_id (20-Team Isolation)",
  },
  {
    table: "public.fantasy_teams",
    policy: "authenticated Only (Anti-Scrape)",
  },
  {
    table: "stadiums • franchises • players • matches",
    policy: "Public Read • Service-Role Write Only",
  },
];

export default async function SettingsPage() {
  const rlsSnapshot = await getMemberRlsSnapshot();

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 py-12 space-y-16">
      <MorphTransition name="hero-settings">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6 pt-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-ivory/4 border border-ivory/12 px-3.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-gold animate-pulse-live" />
              <span className="eyebrow-label text-[10px]">
                04 / 04 &mdash; MEMBER PAVILION
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-normal text-ivory leading-[1.05]">
              Private by{" "}
              <span className="italic text-accent-gold">architecture.</span>
            </h1>

            <p className="text-sm sm:text-base text-ivory-muted leading-relaxed">
              Sign in to unlock your personal 20-team matchday portfolio (4
              locked high-probability core lineups + 16 unique differential
              combinations) and real-time ball-by-ball leaderboard tracking.
            </p>

            <div className="space-y-4 pt-2 border-t border-ivory/10">
              {PRIVACY_PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-ivory/4 border border-ivory/10 text-accent-gold">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ivory">
                        {pillar.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-ivory-muted leading-relaxed">
                        {pillar.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-sm glass-card p-5 border border-ivory/12 space-y-3.5">
              <div className="flex items-center justify-between border-b border-ivory/10 pb-2.5">
                <span className="eyebrow-label text-accent-gold flex items-center gap-2 text-[10px]">
                  <Database className="h-3.5 w-3.5" />
                  POSTGRESQL RLS FIREWALL
                </span>
                <span className="font-mono text-[10px] text-[#8ec2a8] tabular-score flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />7 / 7 TABLES LOCKED
                </span>
              </div>

              <div className="space-y-2 text-[11px] font-mono tabular-score">
                {RLS_PROTECTED_TABLES.map((item) => (
                  <div
                    key={item.table}
                    className="flex items-center justify-between gap-2 text-ivory-muted"
                  >
                    <span className="text-ivory/90 truncate">{item.table}</span>
                    <span className="text-accent-gold shrink-0 text-[10px]">
                      {item.policy}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-ivory/10 pt-2.5 flex items-center justify-between text-[10px] font-mono text-ivory-dim tabular-score">
                <span>Profile Row Sync</span>
                <span className="text-ivory">
                  {rlsSnapshot.profile
                    ? `Active (${rlsSnapshot.profile.account_tier} Tier)`
                    : "Awaiting Member Sign-In"}
                </span>
              </div>
            </div>

            <div className="pt-1">
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Stadium Overview</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <AuthSheet />
          </div>
        </div>
      </MorphTransition>

      <FranchiseThemeSelector
        franchises={rlsSnapshot.franchises}
        initialProfile={rlsSnapshot.profile}
      />
    </div>
  );
}