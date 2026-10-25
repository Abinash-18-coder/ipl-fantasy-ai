import React from "react";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <MorphTransition name="hero-settings">
        <div className="glass-card rounded-2xl p-8 space-y-4 shadow-glass-panel">
          <div className="flex items-center justify-between">
            <Badge variant="outline">MUMBAI (ap-south-1)</Badge>
            <span className="text-xs font-semibold text-slate-400 tabular-score">
              proxy.ts Guard Ready
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Settings className="h-7 w-7 text-pitch-turf" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Auth & Franchise Theme Engine
            </h1>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Supabase SSR Google OAuth, passwordless Magic Link login, and
            favorite IPL franchise ambient theme selector will be wired here in
            Week 2.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Stadium Overview</span>
            </Link>
          </Button>
        </div>
      </MorphTransition>
    </div>
  );
}