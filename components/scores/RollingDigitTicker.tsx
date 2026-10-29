"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface RollingDigitTickerProps {
  value: string | number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

function isNumericChar(char: string): boolean {
  return char >= "0" && char <= "9";
}

export function RollingDigitTicker({
  value,
  className,
  prefix,
  suffix,
}: RollingDigitTickerProps) {
  const formatted = String(value);
  const characters = formatted.split("");

  return (
    <span
      className={cn(
        "inline-flex items-baseline tabular-score font-mono tracking-tight select-none",
        className
      )}
    >
      {prefix && <span className="mr-1 opacity-75">{prefix}</span>}

      <span className="inline-flex items-baseline overflow-hidden">
        {characters.map((char, index) => {
          if (!isNumericChar(char)) {
            return (
              <span
                key={`sep-${index}-${char}`}
                className="inline-block px-[0.5px] opacity-80"
              >
                {char}
              </span>
            );
          }

          return (
            <span
              key={`col-${index}`}
              className="relative inline-flex h-[1.15em] w-[0.62em] items-center justify-center overflow-hidden align-baseline"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={`digit-${index}-${char}`}
                  initial={{ y: "95%", opacity: 0, filter: "blur(2px)" }}
                  animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: "-95%", opacity: 0, filter: "blur(2px)" }}
                  transition={SPRING_SNAPPY}
                  className="inline-block tabular-score"
                >
                  {char}
                </motion.span>
              </AnimatePresence>
            </span>
          );
        })}
      </span>

      {suffix && <span className="ml-1 opacity-75">{suffix}</span>}
    </span>
  );
}