import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors tabular-score",
  {
    variants: {
      variant: {
        default:
          "bg-[#c8b273]/12 text-[#d8c48b] border border-[#c8b273]/30",
        provisional:
          "bg-[#c8b273]/10 text-[#c8b273] border border-[#c8b273]/25",
        confirmed:
          "bg-[#5b8c75]/15 text-[#8ec2a8] border border-[#5b8c75]/35",
        live:
          "bg-[#c95b5b]/15 text-[#eb8f8f] border border-[#c95b5b]/35",
        outline:
          "text-ivory-muted border border-ivory/15 bg-ivory/[0.03]",
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