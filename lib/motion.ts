// File: lib/motion.ts
import type { Transition, Variants } from "motion/react";

/**
 * High-precision spring physics for layoutId sliding pills & dock indicators (Day 4)
 */
export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

/**
 * Smooth spring transition for card-to-hero morphs and slide-over drawers
 */
export const SPRING_GENTLE: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 1,
};

/**
 * Bouncy spring for live ball-by-ball delivery circles (Day 25) & rank jumps (Day 101)
 */
export const SPRING_BOUNCY: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 22,
  mass: 0.7,
};

/**
 * Reusable stagger container and card entrance variants
 */
export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const FADE_UP_ITEM: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRING_GENTLE,
  },
};