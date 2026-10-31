"use client";

import React, { useId, useState } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormSparklineProps {
  points: readonly number[];
  accentHex?: string;
  width?: number;
  height?: number;
  showLabels?: boolean;
  className?: string;
}

const MATCH_LABELS = ["M-3", "M-2", "M-1", "LATEST"] as const;

export function FormSparkline({
  points,
  accentHex = "#c8b273",
  width = 180,
  height = 54,
  showLabels = true,
  className,
}: FormSparklineProps) {
  const gradientId = useId().replace(/:/g, "");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const safePoints: [number, number, number, number] = [
    points[0] ?? 55,
    points[1] ?? 62,
    points[2] ?? 68,
    points[3] ?? 74,
  ];

  const minVal = Math.min(...safePoints);
  const maxVal = Math.max(...safePoints);
  const meanVal =
    (safePoints[0] + safePoints[1] + safePoints[2] + safePoints[3]) / 4;
  const momentumDelta = safePoints[3] - safePoints[0];

  const padX = 10;
  const padY = 9;
  const innerWidth = width - padX * 2;
  const innerHeight = height - padY * 2;
  const span = Math.max(12, maxVal - minVal);

  const coords = safePoints.map((val, idx) => {
    const x = padX + (idx / 3) * innerWidth;
    const normalizedY = (val - minVal) / span;
    const y = padY + innerHeight - normalizedY * innerHeight;
    return {
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
      val,
      label: MATCH_LABELS[idx] ?? `M${idx + 1}`,
    };
  });

  const meanNormalized = (meanVal - minVal) / span;
  const meanY = Number(
    (padY + innerHeight - meanNormalized * innerHeight).toFixed(1)
  );

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const firstCoord = coords[0]!;
  const lastCoord = coords[coords.length - 1]!;
  const areaPath = `M ${firstCoord.x},${height - 2} L ${coords
    .map((c) => `${c.x},${c.y}`)
    .join(" L ")} L ${lastCoord.x},${height - 2} Z`;

  const strokeColor =
    momentumDelta >= 6
      ? "#8ec2a8"
      : momentumDelta <= -6
        ? "#eb8f8f"
        : accentHex;

  const activeCoord =
    hoveredIdx !== null ? coords[hoveredIdx] : coords[coords.length - 1];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between text-[10px] font-mono tabular-score">
        <span className="text-ivory-dim uppercase tracking-wider">
          {activeCoord?.label}:{" "}
          <strong className="text-ivory">{activeCoord?.val} PTS</strong>
        </span>

        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold border",
            momentumDelta >= 6
              ? "bg-sage-turf/20 border-[#8ec2a8]/40 text-[#8ec2a8]"
              : momentumDelta <= -6
                ? "bg-accent-crimson/20 border-accent-crimson/40 text-[#ffb4b4]"
                : "bg-accent-gold/15 border-accent-gold/35 text-accent-gold"
          )}
        >
          {momentumDelta > 0 ? (
            <TrendingUp className="h-2.5 w-2.5" />
          ) : momentumDelta < 0 ? (
            <TrendingDown className="h-2.5 w-2.5" />
          ) : (
            <Minus className="h-2.5 w-2.5" />
          )}
          {momentumDelta > 0 ? `+${momentumDelta}` : momentumDelta}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible select-none"
        style={{ height: `${height}px` }}
        aria-label="4-Match Form Factor Sparkline"
      >
        <defs>
          <linearGradient
            id={`spark_fill_${gradientId}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.34" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <line
          x1={padX}
          y1={meanY}
          x2={width - padX}
          y2={meanY}
          stroke="rgba(244, 241, 234, 0.16)"
          strokeDasharray="3 3"
          strokeWidth="1"
        />

        <path d={areaPath} fill={`url(#spark_fill_${gradientId})`} />

        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />

        {coords.map((pt, idx) => {
          const isLatest = idx === coords.length - 1;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={pt.label}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={10}
                fill="transparent"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered || isLatest ? 3.6 : 2.5}
                fill={isHovered || isLatest ? strokeColor : "#090b0c"}
                stroke={strokeColor}
                strokeWidth={isHovered || isLatest ? 2 : 1.5}
              />
            </g>
          );
        })}
      </svg>

      {showLabels && (
        <div className="flex items-center justify-between text-[9px] font-mono text-ivory-dim tabular-score">
          {safePoints.map((score, i) => (
            <span
              key={`score-pill-${i}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={cn(
                "px-1 py-0.5 rounded-xs transition-colors cursor-pointer",
                hoveredIdx === i || i === 3
                  ? "bg-ivory/10 text-ivory font-semibold"
                  : "text-ivory-dim"
              )}
            >
              {score}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}