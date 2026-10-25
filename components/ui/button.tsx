import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-gold disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "rounded-sm bg-[#c8b273] text-[#090b0c] hover:bg-[#d6c285] shadow-turf-glow font-bold",
        gold:
          "rounded-sm bg-gold-gradient text-[#090b0c] hover:brightness-105 shadow-gold-glow font-bold",
        ivory:
          "rounded-full bg-[#f4f1ea] text-[#090b0c] hover:bg-white font-semibold tracking-[0.08em] normal-case text-xs shadow-sm",
        destructive:
          "rounded-sm bg-accent-crimson text-white hover:bg-red-700",
        outline:
          "rounded-sm border border-[#f4f1ea]/25 bg-[#f4f1ea]/[0.04] text-[#f4f1ea] hover:bg-[#f4f1ea]/[0.1] hover:border-[#f4f1ea]/45 backdrop-blur-md",
        secondary:
          "rounded-sm bg-stadium-card text-ivory hover:bg-mist-slate border border-ivory/10",
        ghost:
          "rounded-sm text-ivory-muted hover:text-ivory hover:bg-ivory/5",
        link:
          "text-accent-gold underline-offset-8 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-[11px]",
        lg: "h-13 px-8 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };