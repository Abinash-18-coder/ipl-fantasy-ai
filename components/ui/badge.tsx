// File: components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition-colors tabular-score",
  {
    variants: {
      variant: {
        default:
          "bg-pitch-turf/15 text-pitch-turf border border-pitch-turf/30",
        provisional:
          "bg-accent-gold/15 text-accent-gold border border-accent-gold/40",
        confirmed:
          "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-turf-glow",
        live:
          "bg-red-500/20 text-red-400 border border-red-500/40",
        outline:
          "text-slate-300 border border-slate-700 bg-slate-900/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };