import { dispatchFranchiseThemeEvent } from "@/components/ui/CursorGridBackdrop";
import type { FranchiseCode } from "@/types";

export interface FranchiseThemeSpec {
  code: FranchiseCode;
  name: string;
  shortCity: string;
  primaryHex: string;
  secondaryHex: string;
  glowRgba: string;
  crestTagline: string;
  homeVenue: string;
}

export const FRANCHISE_THEME_REGISTRY: Record<
  FranchiseCode,
  FranchiseThemeSpec
> = {
  CSK: {
    code: "CSK",
    name: "Chennai Super Kings",
    shortCity: "Chennai",
    primaryHex: "#d9a74a",
    secondaryHex: "#1d428a",
    glowRgba: "rgba(217, 167, 74, 0.24)",
    crestTagline: " Marina Spin Fortress",
    homeVenue: "M. A. Chidambaram Stadium",
  },
  MI: {
    code: "MI",
    name: "Mumbai Indians",
    shortCity: "Mumbai",
    primaryHex: "#3b6ea5",
    secondaryHex: "#c8b273",
    glowRgba: "rgba(59, 110, 165, 0.26)",
    crestTagline: "Arabian Sea Swing Corridor",
    homeVenue: "Wankhede Stadium",
  },
  RCB: {
    code: "RCB",
    name: "Royal Challengers Bengaluru",
    shortCity: "Bengaluru",
    primaryHex: "#b84242",
    secondaryHex: "#c8b273",
    glowRgba: "rgba(184, 66, 66, 0.25)",
    crestTagline: "High-Altitude Sixes Arena",
    homeVenue: "M. Chinnaswamy Stadium",
  },
  KKR: {
    code: "KKR",
    name: "Kolkata Knight Riders",
    shortCity: "Kolkata",
    primaryHex: "#6d4c9c",
    secondaryHex: "#d4af37",
    glowRgba: "rgba(109, 76, 156, 0.26)",
    crestTagline: "Hooghly Mystery Spin Deck",
    homeVenue: "Eden Gardens",
  },
  RR: {
    code: "RR",
    name: "Rajasthan Royals",
    shortCity: "Jaipur",
    primaryHex: "#b85486",
    secondaryHex: "#254aa5",
    glowRgba: "rgba(184, 84, 134, 0.24)",
    crestTagline: "Pink City Deep Boundary",
    homeVenue: "Sawai Mansingh Stadium",
  },
  GT: {
    code: "GT",
    name: "Gujarat Titans",
    shortCity: "Ahmedabad",
    primaryHex: "#4a6b82",
    secondaryHex: "#c8b273",
    glowRgba: "rgba(74, 107, 130, 0.25)",
    crestTagline: "Sabarmati Hybrid Seam Deck",
    homeVenue: "Narendra Modi Stadium",
  },
  LSG: {
    code: "LSG",
    name: "Lucknow Super Giants",
    shortCity: "Lucknow",
    primaryHex: "#3b6fb6",
    secondaryHex: "#d97736",
    glowRgba: "rgba(59, 111, 182, 0.24)",
    crestTagline: "Ekana Tactical Low-Bounce",
    homeVenue: "BRSABV Ekana Stadium",
  },
  DC: {
    code: "DC",
    name: "Delhi Capitals",
    shortCity: "Delhi",
    primaryHex: "#3b5998",
    secondaryHex: "#c94a4a",
    glowRgba: "rgba(59, 89, 152, 0.25)",
    crestTagline: "Capital Powerplay Track",
    homeVenue: "Arun Jaitley Stadium",
  },
  PBKS: {
    code: "PBKS",
    name: "Punjab Kings",
    shortCity: "Mohali",
    primaryHex: "#c2464c",
    secondaryHex: "#d4be81",
    glowRgba: "rgba(194, 70, 76, 0.24)",
    crestTagline: "Northern True-Seam Carry",
    homeVenue: "Mullanpur Cricket Stadium",
  },
  SRH: {
    code: "SRH",
    name: "Sunrisers Hyderabad",
    shortCity: "Hyderabad",
    primaryHex: "#cf6a38",
    secondaryHex: "#222b30",
    glowRgba: "rgba(207, 106, 56, 0.25)",
    crestTagline: "Deccan High-Velocity Flat Deck",
    homeVenue: "Rajiv Gandhi Intl. Stadium",
  },
};

export function getFranchiseTheme(code: FranchiseCode): FranchiseThemeSpec {
  return FRANCHISE_THEME_REGISTRY[code] ?? FRANCHISE_THEME_REGISTRY.MI;
}

export function buildDualFranchiseGradient(
  homeCode: FranchiseCode,
  awayCode: FranchiseCode
): {
  stageBackground: string;
  topHairline: string;
  homeSpec: FranchiseThemeSpec;
  awaySpec: FranchiseThemeSpec;
} {
  const homeSpec = getFranchiseTheme(homeCode);
  const awaySpec = getFranchiseTheme(awayCode);

  const stageBackground = `radial-gradient(circle at 14% 25%, ${homeSpec.primaryHex}26 0%, transparent 52%), radial-gradient(circle at 86% 25%, ${awaySpec.primaryHex}26 0%, transparent 52%), linear-gradient(180deg, rgba(18, 24, 27, 0.86) 0%, rgba(6, 8, 9, 0.96) 100%)`;

  const topHairline = `linear-gradient(90deg, transparent 0%, ${homeSpec.primaryHex} 28%, #c8b273 50%, ${awaySpec.primaryHex} 72%, transparent 100%)`;

  return {
    stageBackground,
    topHairline,
    homeSpec,
    awaySpec,
  };
}

export function applyMatchAmbientLighting(
  homeCode: FranchiseCode,
  awayCode: FranchiseCode
): void {
  if (typeof window === "undefined") return;

  const homeSpec = getFranchiseTheme(homeCode);
  const awaySpec = getFranchiseTheme(awayCode);

  const root = document.documentElement;
  root.style.setProperty("--franchise-home-hex", homeSpec.primaryHex);
  root.style.setProperty("--franchise-away-hex", awaySpec.primaryHex);

  dispatchFranchiseThemeEvent({
    primaryHex: homeSpec.primaryHex,
    secondaryHex: awaySpec.primaryHex,
    code: `${homeCode}_VS_${awayCode}`,
  });
}