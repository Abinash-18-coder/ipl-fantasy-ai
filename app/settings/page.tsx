import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";
import { AuthSheet } from "@/components/auth/AuthSheet";

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

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 py-12 space-y-12">
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

            <div className="pt-2">
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
    </div>
  );
}