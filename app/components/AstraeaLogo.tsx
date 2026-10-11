import React from "react";

export interface AstraeaLogoProps {
  /** Visual display mode */
  variant?: "mark" | "full" | "wordmark";
  /** Size preset */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Background color theme of the mark badge */
  theme?: "blueprint" | "orange" | "dark" | "mono";
  /** Custom additional CSS classes */
  className?: string;
  /** Whether to show the technical subtag (e.g. 'AI' or 'AUTODRAFT') */
  showTag?: boolean;
  tagText?: string;
  /** Optional click handler or title */
  title?: string;
}

const SIZE_MAP = {
  xs: { box: 16, rx: 3.5, font: "text-xs", gap: "gap-1.5" },
  sm: { box: 20, rx: 4.5, font: "text-sm sm:text-base", gap: "gap-2" },
  md: { box: 26, rx: 6, font: "text-base sm:text-lg", gap: "gap-2.5" },
  lg: { box: 36, rx: 8, font: "text-xl sm:text-2xl", gap: "gap-3" },
  xl: { box: 48, rx: 10, font: "text-2xl sm:text-3xl", gap: "gap-3.5" },
};

const THEME_MAP = {
  blueprint: {
    bg: "#1E43D8",
    hoverBg: "#1636B5",
    border: "#101418",
    star: "#FFC53D",
    grid: "rgba(255, 255, 255, 0.18)",
  },
  orange: {
    bg: "#FF5500",
    hoverBg: "#E04A00",
    border: "#101418",
    star: "#FFFFFF",
    grid: "rgba(255, 255, 255, 0.22)",
  },
  dark: {
    bg: "#101418",
    hoverBg: "#1E242C",
    border: "#101418",
    star: "#FFC53D",
    grid: "rgba(255, 255, 255, 0.12)",
  },
  mono: {
    bg: "transparent",
    hoverBg: "rgba(16, 20, 24, 0.05)",
    border: "#101418",
    star: "#FF5500",
    grid: "rgba(16, 20, 24, 0.10)",
  },
};

/**
 * Astraea Brand Logo & Precision Mark
 * - Architectural chevron / caliper legs forming the letter 'A'
 * - Radiant 4-point Astraea star at the apex aperture
 * - Calibrated engineering datum crossbar
 */
export function AstraeaLogo({
  variant = "full",
  size = "sm",
  theme = "blueprint",
  className = "",
  showTag = false,
  tagText = "AI",
  title = "Astraea",
}: AstraeaLogoProps) {
  const s = SIZE_MAP[size];
  const t = THEME_MAP[theme];

  const markSvg = (
    <div
      className="relative flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
      style={{ width: `${s.box}px`, height: `${s.box}px` }}
      title={title}
    >
      <svg
        viewBox="0 0 32 32"
        width={s.box}
        height={s.box}
        className="w-full h-full drop-shadow-[1px_1px_0_rgba(16,20,24,0.15)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Technical Badge Background */}
        <rect
          width="32"
          height="32"
          rx={s.rx * (32 / s.box)}
          fill={t.bg}
          stroke={t.border}
          strokeWidth="1.6"
        />

        {/* CAD Drafting Coordinate Grid Crosshairs */}
        <line
          x1="16"
          y1="2"
          x2="16"
          y2="30"
          stroke={t.grid}
          strokeWidth="0.8"
          strokeDasharray="1.5 2"
        />
        <line
          x1="2"
          y1="16"
          x2="30"
          y2="16"
          stroke={t.grid}
          strokeWidth="0.8"
          strokeDasharray="1.5 2"
        />

        {/* Left Faceted Caliper Blade ('A' left leg) */}
        <path
          d="M16 5.5L7 25.5H11.5L16 15.5V5.5Z"
          fill={theme === "mono" ? "#101418" : "#FFFFFF"}
          fillOpacity={theme === "mono" ? 0.95 : 0.95}
        />

        {/* Right Faceted Caliper Blade ('A' right leg, dimensional shading) */}
        <path
          d="M16 5.5L25 25.5H20.5L16 15.5V5.5Z"
          fill={theme === "mono" ? "#101418" : "#FFFFFF"}
          fillOpacity={theme === "mono" ? 0.75 : 0.78}
        />

        {/* Precision Engineering Datum Bar */}
        <path
          d="M9.8 19.2H22.2"
          stroke={theme === "mono" ? "#101418" : "#FFFFFF"}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          cx="16"
          cy="19.2"
          r="1.4"
          fill={t.bg === "transparent" ? "#FFFBF0" : t.bg}
          stroke={theme === "mono" ? "#101418" : "#FFFFFF"}
          strokeWidth="1"
        />

        {/* Astraea 4-Point Radiant Precision Star */}
        <path
          d="M16 9L17.1 11.7L19.8 12.8L17.1 13.9L16 16.6L14.9 13.9L12.2 12.8L14.9 11.7Z"
          fill={t.star}
        />
      </svg>
    </div>
  );

  if (variant === "mark") {
    return <div className={`inline-flex items-center ${className}`}>{markSvg}</div>;
  }

  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      {variant !== "wordmark" && markSvg}
      <div className="flex items-center gap-1.5 leading-none">
        <span
          className={`font-display font-bold tracking-tight text-[#101418] select-none ${s.font}`}
        >
          Astraea
        </span>
        {showTag && (
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#1E43D8] bg-[#1E43D8]/10 px-1 py-0.2 rounded border border-[#1E43D8]/20 select-none">
            {tagText}
          </span>
        )}
      </div>
    </div>
  );
}
export default AstraeaLogo;

