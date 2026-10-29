import fs from "node:fs";
import path from "node:path";
import type { FranchiseCode } from "../types";

export interface StarVisualTrait {
  skinTone: "fair" | "wheat" | "medium" | "deep" | "ebony";
  hairStyle: "fade" | "long" | "curly" | "mohawk" | "short" | "headband";
  beardStyle: "boxed" | "full" | "stubble" | "goatee" | "mustache" | "clean";
  accessory?: "gold-chain" | "headband" | "bandana";
}

const SKIN_PALETTES: Record<
  StarVisualTrait["skinTone"],
  { top: string; bottom: string; shadow: string; highlight: string }
> = {
  fair: {
    top: "#F2C6A0",
    bottom: "#D9A279",
    shadow: "#B87E56",
    highlight: "#FFE0C4",
  },
  wheat: {
    top: "#E5AF84",
    bottom: "#C6885C",
    shadow: "#9E633B",
    highlight: "#F7CBA8",
  },
  medium: {
    top: "#D19468",
    bottom: "#AD6F44",
    shadow: "#854E28",
    highlight: "#E6B18A",
  },
  deep: {
    top: "#A66A43",
    bottom: "#824D2B",
    shadow: "#5E3317",
    highlight: "#C28760",
  },
  ebony: {
    top: "#78472A",
    bottom: "#542E18",
    shadow: "#381B0B",
    highlight: "#946040",
  },
};

const JERSEY_COLORS: Record<
  FranchiseCode,
  { primary: string; secondary: string; collar: string }
> = {
  CSK: { primary: "#E5A93C", secondary: "#1D428A", collar: "#1D428A" },
  MI: { primary: "#1A4B8C", secondary: "#0D2B52", collar: "#C8B273" },
  RCB: { primary: "#A8242B", secondary: "#14181D", collar: "#C8B273" },
  KKR: { primary: "#4B2E78", secondary: "#261542", collar: "#D4AF37" },
  RR: { primary: "#C23B78", secondary: "#1E3A8A", collar: "#38BDF8" },
  GT: { primary: "#1E2D40", secondary: "#0F1722", collar: "#C8B273" },
  LSG: { primary: "#1E56A0", secondary: "#103160", collar: "#E06D2B" },
  DC: { primary: "#1E3F7A", secondary: "#9E2A2B", collar: "#E63946" },
  PBKS: { primary: "#B82D35", secondary: "#6E1419", collar: "#D4BE81" },
  SRH: { primary: "#D95D26", secondary: "#181B20", collar: "#F59E0B" },
};

const STAR_TRAIT_OVERRIDES: Record<string, StarVisualTrait> = {
  "rcb-virat-kohli": {
    skinTone: "wheat",
    hairStyle: "fade",
    beardStyle: "boxed",
  },
  "csk-ms-dhoni": {
    skinTone: "medium",
    hairStyle: "long",
    beardStyle: "goatee",
  },
  "mi-rohit-sharma": {
    skinTone: "wheat",
    hairStyle: "short",
    beardStyle: "stubble",
  },
  "mi-hardik-pandya": {
    skinTone: "deep",
    hairStyle: "fade",
    beardStyle: "boxed",
    accessory: "gold-chain",
  },
  "mi-suryakumar-yadav": {
    skinTone: "medium",
    hairStyle: "fade",
    beardStyle: "boxed",
  },
  "mi-jasprit-bumrah": {
    skinTone: "wheat",
    hairStyle: "short",
    beardStyle: "stubble",
  },
  "csk-ravindra-jadeja": {
    skinTone: "medium",
    hairStyle: "curly",
    beardStyle: "mustache",
    accessory: "headband",
  },
  "csk-matheesha-pathirana": {
    skinTone: "deep",
    hairStyle: "curly",
    beardStyle: "stubble",
    accessory: "headband",
  },
  "kkr-sunil-narine": {
    skinTone: "deep",
    hairStyle: "mohawk",
    beardStyle: "goatee",
  },
  "kkr-andre-russell": {
    skinTone: "ebony",
    hairStyle: "mohawk",
    beardStyle: "boxed",
    accessory: "gold-chain",
  },
  "gt-shubman-gill": {
    skinTone: "wheat",
    hairStyle: "fade",
    beardStyle: "clean",
  },
  "gt-rashid-khan": {
    skinTone: "wheat",
    hairStyle: "short",
    beardStyle: "full",
  },
  "lsg-rishabh-pant": {
    skinTone: "wheat",
    hairStyle: "short",
    beardStyle: "stubble",
  },
  "dc-kl-rahul": {
    skinTone: "medium",
    hairStyle: "fade",
    beardStyle: "boxed",
  },
  "rr-sanju-samson": {
    skinTone: "deep",
    hairStyle: "curly",
    beardStyle: "boxed",
  },
  "rr-yashasvi-jaiswal": {
    skinTone: "wheat",
    hairStyle: "fade",
    beardStyle: "clean",
  },
  "srh-travis-head": {
    skinTone: "fair",
    hairStyle: "short",
    beardStyle: "mustache",
  },
  "srh-pat-cummins": {
    skinTone: "fair",
    hairStyle: "fade",
    beardStyle: "stubble",
  },
  "srh-heinrich-klaasen": {
    skinTone: "fair",
    hairStyle: "short",
    beardStyle: "stubble",
  },
  "pbks-shreyas-iyer": {
    skinTone: "medium",
    hairStyle: "fade",
    beardStyle: "boxed",
  },
  "pbks-arshdeep-singh": {
    skinTone: "wheat",
    hairStyle: "headband",
    beardStyle: "full",
    accessory: "headband",
  },
};

function deriveDeterministicTrait(
  externalId: string,
  index: number
): StarVisualTrait {
  const override = STAR_TRAIT_OVERRIDES[externalId];
  if (override) return override;

  const skinKeys: StarVisualTrait["skinTone"][] = [
    "wheat",
    "medium",
    "fair",
    "deep",
    "ebony",
  ];
  const hairKeys: StarVisualTrait["hairStyle"][] = [
    "fade",
    "short",
    "curly",
    "long",
  ];
  const beardKeys: StarVisualTrait["beardStyle"][] = [
    "boxed",
    "stubble",
    "clean",
    "full",
    "goatee",
  ];

  return {
    skinTone: skinKeys[index % skinKeys.length] ?? "wheat",
    hairStyle: hairKeys[(index * 3) % hairKeys.length] ?? "fade",
    beardStyle: beardKeys[(index * 7) % beardKeys.length] ?? "boxed",
  };
}

export function renderPlayerPortraitSvg(
  externalId: string,
  franchise: FranchiseCode,
  index: number
): string {
  const trait = deriveDeterministicTrait(externalId, index);
  const skin = SKIN_PALETTES[trait.skinTone];
  const jersey = JERSEY_COLORS[franchise];

  const hairPath =
    trait.hairStyle === "long"
      ? `<path d="M44 76C42 40 56 18 100 18C144 18 158 40 156 76C158 105 164 128 152 136C146 112 148 86 144 68C136 48 120 42 100 42C80 42 64 48 56 68C52 86 54 112 48 136C36 128 42 105 44 76Z" fill="#141212"/>`
      : trait.hairStyle === "mohawk"
        ? `<path d="M78 14C90 8 110 8 122 14L126 48C110 42 90 42 74 48L78 14Z" fill="#141212"/><path d="M58 64C58 40 74 26 100 26C126 26 142 40 142 64C136 50 122 44 100 44C78 44 64 50 58 64Z" fill="#1E1B1B"/>`
        : trait.hairStyle === "curly"
          ? `<path d="M52 68C46 38 66 18 100 18C134 18 154 38 148 68C142 52 124 44 100 44C76 44 58 52 52 68Z" fill="#141212"/><circle cx="64" cy="36" r="12" fill="#141212"/><circle cx="86" cy="28" r="14" fill="#141212"/><circle cx="114" cy="28" r="14" fill="#141212"/><circle cx="136" cy="36" r="12" fill="#141212"/>`
          : `<path d="M54 68C52 38 68 20 100 20C132 20 148 38 146 68C141 50 124 42 100 42C76 42 59 50 54 68Z" fill="#141212"/><path d="M62 28C78 20 112 20 132 32" stroke="#2D2828" stroke-width="3" stroke-linecap="round"/>`;

  const beardPath =
    trait.beardStyle === "clean"
      ? `<path d="M86 112C94 116 106 116 114 112" stroke="${skin.shadow}" stroke-width="2.8" stroke-linecap="round"/>`
      : trait.beardStyle === "mustache"
        ? `<path d="M76 106C86 100 114 100 124 106C116 110 84 110 76 106Z" fill="#161313"/><path d="M86 113C94 117 106 117 114 113" stroke="#F5BCA0" stroke-width="2.5" stroke-linecap="round"/>`
        : trait.beardStyle === "stubble"
          ? `<path d="M58 92C58 118 74 138 100 138C126 138 142 118 142 92C136 104 126 110 116 110C110 103 90 103 84 110C74 110 64 104 58 92Z" fill="#181515" fill-opacity="0.42"/><path d="M86 112C94 116 106 116 114 112" stroke="#E8B090" stroke-width="2.5" stroke-linecap="round"/>`
          : `<path d="M56 88C56 118 72 140 100 140C128 140 144 118 144 88C138 100 128 108 118 108C112 100 88 100 82 108C72 108 62 100 56 88Z" fill="#141111"/><path d="M78 106C88 101 112 101 122 106" stroke="#141111" stroke-width="5" stroke-linecap="round"/><path d="M86 112C94 116 106 116 114 112" stroke="#E5A888" stroke-width="2.6" stroke-linecap="round"/><path d="M94 119H106L103 128H97L94 119Z" fill="#141111"/>`;

  const headbandMarkup =
    trait.accessory === "headband" || trait.hairStyle === "headband"
      ? `<path d="M53 54C72 46 128 46 147 54L146 63C126 56 74 56 54 63L53 54Z" fill="${jersey.collar}"/>`
      : "";

  const chainMarkup =
    trait.accessory === "gold-chain"
      ? `<path d="M74 146C84 162 116 162 126 146" stroke="#D4AF37" stroke-width="3.2" stroke-dasharray="4 2" fill="none"/>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <defs>
    <linearGradient id="bg_${externalId}" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0B192C"/>
      <stop offset="100%" stop-color="#05080C"/>
    </linearGradient>
    <linearGradient id="skin_${externalId}" x1="100" y1="40" x2="100" y2="140" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${skin.top}"/>
      <stop offset="100%" stop-color="${skin.bottom}"/>
    </linearGradient>
    <linearGradient id="jersey_${externalId}" x1="30" y1="138" x2="170" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${jersey.primary}"/>
      <stop offset="100%" stop-color="${jersey.secondary}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="36" fill="url(#bg_${externalId})"/>
  <circle cx="100" cy="96" r="78" fill="${jersey.primary}" fill-opacity="0.12"/>
  <path d="M22 200C26 156 54 140 100 140C146 140 174 156 178 200H22Z" fill="url(#jersey_${externalId})"/>
  <path d="M34 158L70 144M166 158L130 144" stroke="#F4F1EA" stroke-opacity="0.85" stroke-width="4" stroke-linecap="round"/>
  <path d="M38 166L72 152M162 166L128 152" stroke="#F4F1EA" stroke-opacity="0.55" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="82" y="118" width="36" height="34" rx="14" fill="${skin.bottom}"/>
  <path d="M82 126C90 136 110 136 118 126V138H82V126Z" fill="${skin.shadow}" fill-opacity="0.55"/>
  <path d="M74 138L100 168L126 138" fill="none" stroke="${jersey.collar}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M78 138L100 163L122 138" fill="none" stroke="#F4F1EA" stroke-width="2.5" stroke-linejoin="round"/>
  ${chainMarkup}
  <ellipse cx="52" cy="90" rx="7" ry="13" fill="${skin.bottom}"/>
  <ellipse cx="148" cy="90" rx="7" ry="13" fill="${skin.bottom}"/>
  <path d="M56 68C56 44 74 32 100 32C126 32 144 44 144 68V94C144 120 126 138 100 138C74 138 56 120 56 94V68Z" fill="url(#skin_${externalId})"/>
  <ellipse cx="82" cy="60" rx="18" ry="8" fill="${skin.highlight}" fill-opacity="0.35"/>
  <path d="M69 75C76 70 86 70 92 74M108 74C114 70 124 70 131 75" stroke="#141111" stroke-width="4.2" stroke-linecap="round"/>
  <ellipse cx="81" cy="83" rx="6.5" ry="4" fill="#FFFFFF"/>
  <ellipse cx="119" cy="83" rx="6.5" ry="4" fill="#FFFFFF"/>
  <circle cx="81" cy="83" r="3.4" fill="#1E1410"/>
  <circle cx="119" cy="83" r="3.4" fill="#1E1410"/>
  <circle cx="82.2" cy="81.8" r="1.1" fill="#FFFFFF"/>
  <circle cx="120.2" cy="81.8" r="1.1" fill="#FFFFFF"/>
  <path d="M100 78V96C96 99 104 99 100 96" stroke="${skin.shadow}" stroke-width="3" stroke-linecap="round"/>
  ${beardPath}
  ${hairPath}
  ${headbandMarkup}
</svg>`;
}

export function ensureCustomPlayerAvatarFile(
  externalId: string,
  franchise: FranchiseCode,
  index: number
): string {
  const playersDir = path.resolve(process.cwd(), "public/avatars/players");
  if (!fs.existsSync(playersDir)) {
    fs.mkdirSync(playersDir, { recursive: true });
  }

  const jpgPath = path.join(playersDir, `${externalId}.jpg`);
  if (fs.existsSync(jpgPath)) {
    return `/avatars/players/${externalId}.jpg`;
  }

  const pngPath = path.join(playersDir, `${externalId}.png`);
  if (fs.existsSync(pngPath)) {
    return `/avatars/players/${externalId}.png`;
  }

  const svgPath = path.join(playersDir, `${externalId}.svg`);
  const svgContent = renderPlayerPortraitSvg(externalId, franchise, index);
  fs.writeFileSync(svgPath, svgContent, "utf8");

  return `/avatars/players/${externalId}.svg`;
}