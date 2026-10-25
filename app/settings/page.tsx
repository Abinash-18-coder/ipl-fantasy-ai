import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-10 py-14 space-y-8">
      <MorphTransition name="hero-settings">
        <div className="glass-card rounded-sm p-8 sm:p-12 space-y-6 shadow-glass-panel border border-ivory/12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-5">
            <span className="eyebrow-label text-accent-gold">
              04 / 04 &mdash; MUMBAI (AP-SOUTH-1) MEMBER ACCESS
            </span>
            <span className="font-mono text-xs text-ivory-muted tabular-score">
              proxy.ts Guard Ready
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-normal text-ivory leading-tight">
            The Member{" "}
            <span className="italic text-accent-gold">Pavilion.</span>
          </h1>

          <p className="text-base text-ivory-muted max-w-2xl leading-relaxed">
            Supabase SSR Google OAuth, passwordless Magic Link entry, and
            bespoke IPL franchise ambient stadium lighting will be wired here
            in Week 2.
          </p>

          <div className="pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Pavilion</span>
              </Link>
            </Button>
          </div>
        </div>
      </MorphTransition>
    </div>
  );
}