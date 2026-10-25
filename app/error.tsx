"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
  unstable_retry?: () => void;
}

export default function GlobalErrorBoundary({
  error,
  reset,
  retry,
  unstable_retry,
}: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleRetry = () => {
    if (typeof retry === "function") {
      retry();
    } else if (typeof unstable_retry === "function") {
      unstable_retry();
    } else if (typeof reset === "function") {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-[65vh] items-center justify-center px-4">
      <div className="glass-card max-w-lg w-full rounded-2xl p-8 text-center space-y-5 border border-red-500/30 shadow-glass-panel">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <Badge variant="live">DRS THIRD UMPIRE REVIEW</Badge>
          <h2 className="text-2xl font-extrabold text-white">
            Stream Interruption Detected
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            An unexpected interruption occurred while rendering this stadium
            view. Your 20 allocated fantasy tickets remain safely locked.
          </p>
        </div>

        {error?.digest && (
          <p className="rounded-lg bg-slate-900/90 py-1.5 px-3 font-mono text-xs text-slate-400 border border-slate-800 tabular-score">
            Digest ID: {error.digest}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button onClick={handleRetry} variant="default">
            <RotateCcw className="h-4 w-4" />
            <span>Retry Stream</span>
          </Button>

          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Return to Stadium Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}