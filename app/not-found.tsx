import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center px-4">
      <div className="glass-card max-w-lg w-full rounded-2xl p-8 text-center space-y-5 border border-slate-800 shadow-glass-panel">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-gold/15 border border-accent-gold/30 text-accent-gold">
          <Compass className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <Badge variant="provisional">404 &bull; OUT OF THE STADIUM</Badge>
          <h1 className="text-3xl font-extrabold text-white">
            Six Runs! Ball Lost in the Stands
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The match scorecard or fantasy ticket URL you requested does not
            exist or has rotated outside our rolling 3-day tournament window.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild variant="default">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Stadium Home</span>
            </Link>
          </Button>

          <Button asChild variant="gold">
            <Link href="/fantasy">
              <Sparkles className="h-4 w-4" />
              <span>Open Fantasy Arena</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}