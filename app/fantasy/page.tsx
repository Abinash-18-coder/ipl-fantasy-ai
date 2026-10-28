import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";
import { createClient } from "@/lib/supabase/server";

export default async function FantasyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/settings?next=/fantasy");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-10 py-14 space-y-8">
      <MorphTransition name="hero-fantasy">
        <div className="glass-card rounded-sm p-8 sm:p-12 space-y-6 shadow-glass-panel border border-ivory/12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-5">
            <span className="eyebrow-label text-accent-gold flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              02 / 04 &mdash; GEMINI 3.8 FLASH HIGH + HIGHS SOLVER
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-sage-turf/15 border border-[#8ec2a8]/35 px-3 py-1 font-mono text-[11px] text-[#8ec2a8] tabular-score">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>VERIFIED: {user.email}</span>
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-normal text-ivory leading-tight">
            The 20-Team{" "}
            <span className="italic text-accent-gold">Fantasy Arena.</span>
          </h1>

          <p className="text-base text-ivory-muted max-w-2xl leading-relaxed">
            Powered by Gemini 3.8 Flash Deep Research and the HiGHS WASM
            integer programming solver. Synthesizes 30 provisional lineups at
            T-24h and executes atomic Playing XI substitutions at T-30m toss.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-sm bg-black/45 p-4 border border-ivory/10">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                LOCKED CORE QUOTA
              </p>
              <p className="mt-1 font-display text-2xl text-ivory tabular-score">
                04 Shared Teams
              </p>
            </div>
            <div className="rounded-sm bg-black/45 p-4 border border-ivory/10">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                DIFFERENTIAL POOL
              </p>
              <p className="mt-1 font-display text-2xl text-accent-gold tabular-score">
                16 Unique Teams
              </p>
            </div>
            <div className="rounded-sm bg-black/45 p-4 border border-ivory/10">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                ROUTE PROTECTION
              </p>
              <p className="mt-1 font-display text-2xl text-[#8ec2a8] tabular-score">
                proxy.ts Active
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Pavilion</span>
              </Link>
            </Button>

            <Button asChild variant="secondary" size="sm">
              <Link href="/settings">
                <span>Manage Session</span>
              </Link>
            </Button>
          </div>
        </div>
      </MorphTransition>
    </div>
  );
}