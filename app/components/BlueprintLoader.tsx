"use client";

import React, { useEffect, useState } from "react";

interface BlueprintLoaderProps {
  progress: number; // 0 to 100
  loadedCount: number; // frames loaded in critical batch
  totalCritical: number; // 53 anchor frames (001-025 + every 10th frame)
  fontsReady: boolean;
  isWiping: boolean;
  onWipeComplete: () => void;
}

export function BlueprintLoader({
  progress,
  loadedCount,
  totalCritical,
  fontsReady,
  isWiping,
  onWipeComplete,
}: BlueprintLoaderProps) {
  const [displayPercent, setDisplayPercent] = useState(0);

  // Smoothly climb display percentage as real assets decode
  useEffect(() => {
    setDisplayPercent((prev) => {
      if (progress > prev) {
        return Math.min(progress, 100);
      }
      return prev;
    });
  }, [progress]);

  // Handle wipe completion event
  useEffect(() => {
    if (isWiping) {
      const timer = setTimeout(() => {
        onWipeComplete();
      }, 750); // Matches the 750ms panel transition duration
      return () => clearTimeout(timer);
    }
  }, [isWiping, onWipeComplete]);

  return (
    <div
      aria-live="polite"
      aria-busy={!isWiping}
      className="fixed inset-0 z-[100] pointer-events-auto select-none overflow-hidden"
    >
      {/* =================================================================== */}
      {/* 1. LEFT PANEL (Wipes outward to the left)                           */}
      {/* =================================================================== */}
      <div
        className={`absolute top-0 left-0 w-1/2 h-full bg-[#f4ebd7] bg-drafting-grid border-r border-[#101418] transition-transform duration-750 ease-[cubic-bezier(0.77,0,0.175,1)] will-change-transform ${
          isWiping ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Left Panel Technical Corner Registration Marks */}
        <div className="absolute top-4 left-4 font-mono text-[9px] text-[#5c6470] tracking-wider">
          + 00.00 / 00.00 [ORIGIN]
        </div>
        <div className="absolute bottom-4 left-4 font-mono text-[9px] text-[#5c6470] tracking-wider">
          + 00.00 / 100.00 [DATUM A]
        </div>

        {/* Centerline symbol on the right edge */}
        <div className="absolute top-1/2 right-2 -translate-y-1/2 font-mono text-[10px] text-[#101418]/60 font-bold">
          ℄
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. RIGHT PANEL (Wipes outward to the right)                         */}
      {/* =================================================================== */}
      <div
        className={`absolute top-0 right-0 w-1/2 h-full bg-[#f4ebd7] bg-drafting-grid border-l border-[#101418] transition-transform duration-750 ease-[cubic-bezier(0.77,0,0.175,1)] will-change-transform ${
          isWiping ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Right Panel Technical Corner Registration Marks */}
        <div className="absolute top-4 right-4 font-mono text-[9px] text-[#5c6470] tracking-wider text-right">
          + 100.00 / 00.00 [DATUM B]
        </div>
        <div className="absolute bottom-4 right-4 font-mono text-[9px] text-[#5c6470] tracking-wider text-right">
          + 100.00 / 100.00 [DATUM C]
        </div>

        {/* Centerline symbol on the left edge */}
        <div className="absolute top-1/2 left-2 -translate-y-1/2 font-mono text-[10px] text-[#101418]/60 font-bold">
          ℄
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. CENTER CONTENT OVERLAY (Fades out when wipe begins)              */}
      {/* =================================================================== */}
      <div
        className={`fixed inset-0 z-[101] flex flex-col items-center justify-center p-6 transition-all duration-300 ease-out ${
          isWiping ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        {/* Technical Title Header */}
        <div className="text-center space-y-1.5 mb-8">
          <div className="inline-flex items-center gap-2 bg-[#FFFBF0] border border-[#101418] px-3 py-1 rounded-[2px] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#124ead] animate-ping" />
            <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#101418] uppercase tracking-wider">
              ASTRAEA // ASSET-GATED INITIALIZATION
            </span>
          </div>
          <div className="font-mono text-[11px] sm:text-[12px] text-[#5c6470] uppercase tracking-wider">
            SHT. 00 · CRITICAL SEQUENCE · DECODING {totalCritical} ANCHOR FRAMES (001–025 + EVERY 10TH)
          </div>
        </div>

        {/* Centered Animated Blueprint CAD Mark */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-8">
          {/* Animated SVG Blueprint Drawing */}
          <svg
            className="w-full h-full text-[#124ead]"
            viewBox="0 0 160 160"
            fill="none"
            stroke="currentColor"
          >
            {/* Outer drafting frame */}
            <rect
              x="10"
              y="10"
              width="140"
              height="140"
              stroke="#101418"
              strokeWidth="1.5"
              strokeDasharray="6 3"
              className="animate-pulse"
            />

            {/* Corner crosshairs */}
            <line x1="4" y1="10" x2="16" y2="10" stroke="#101418" strokeWidth="1.5" />
            <line x1="10" y1="4" x2="10" y2="16" stroke="#101418" strokeWidth="1.5" />

            <line x1="144" y1="10" x2="156" y2="10" stroke="#101418" strokeWidth="1.5" />
            <line x1="150" y1="4" x2="150" y2="16" stroke="#101418" strokeWidth="1.5" />

            <line x1="4" y1="150" x2="16" y2="150" stroke="#101418" strokeWidth="1.5" />
            <line x1="10" y1="144" x2="10" y2="156" stroke="#101418" strokeWidth="1.5" />

            <line x1="144" y1="150" x2="156" y2="150" stroke="#101418" strokeWidth="1.5" />
            <line x1="150" y1="144" x2="150" y2="156" stroke="#101418" strokeWidth="1.5" />

            {/* Rotating Technical CAD Compass Ring */}
            <circle
              cx="80"
              cy="80"
              r="48"
              stroke="#124ead"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              className="animate-[spin_12s_linear_infinite]"
            />

            {/* Inner Isometric Wireframe Geometry (Drawing Itself) */}
            <g stroke="#124ead" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {/* Isometric Top Diamond */}
              <polygon
                points="80,42 110,58 80,74 50,58"
                fill="#124ead"
                fillOpacity="0.08"
                strokeDasharray="200"
                strokeDashoffset="0"
              />
              {/* Vertical Stems */}
              <line x1="50" y1="58" x2="50" y2="98" />
              <line x1="80" y1="74" x2="80" y2="114" />
              <line x1="110" y1="58" x2="110" y2="98" />
              {/* Bottom V */}
              <line x1="50" y1="98" x2="80" y2="114" />
              <line x1="80" y1="114" x2="110" y2="98" />

              {/* Center Bore Pin */}
              <circle cx="80" cy="74" r="7" fill="#f4ebd7" stroke="#124ead" strokeWidth="1.5" />
              <line x1="73" y1="74" x2="87" y2="74" strokeWidth="1" />
              <line x1="80" y1="67" x2="80" y2="81" strokeWidth="1" />
            </g>

            {/* Compass Axis Crosshairs */}
            <line x1="24" y1="80" x2="42" y2="80" stroke="#5c6470" strokeWidth="1" />
            <line x1="118" y1="80" x2="136" y2="80" stroke="#5c6470" strokeWidth="1" />
            <line x1="80" y1="24" x2="80" y2="42" stroke="#5c6470" strokeWidth="1" />
            <line x1="80" y1="118" x2="80" y2="136" stroke="#5c6470" strokeWidth="1" />
          </svg>

          {/* Precision Pulse Dot at Center */}
          <div className="absolute w-2 h-2 rounded-full bg-[#ff5500] shadow-[0_0_8px_rgba(255,85,0,0.8)]" />
        </div>

        {/* Real Progress Readout (Climbing Percent) */}
        <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center space-y-3">
          <div className="flex items-baseline justify-between w-full font-mono">
            <span className="text-xs uppercase text-[#5c6470] tracking-wider font-semibold">
              CRITICAL BATCH
            </span>
            <span className="text-3xl sm:text-4xl font-bold text-[#101418] tracking-tight tabular-nums">
              {displayPercent}%
            </span>
          </div>

          {/* Blueprint Progress Bar */}
          <div className="w-full h-3 bg-[#fbf9f4] border-[1.5px] border-[#101418] rounded-[2px] p-0.5 shadow-xs overflow-hidden">
            <div
              className="h-full bg-[#124ead] transition-all duration-150 ease-out rounded-[1px]"
              style={{ width: `${displayPercent}%` }}
            />
          </div>

          {/* Technical Diagnostics Line */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#5c6470] tracking-tight pt-1 border-t border-[#101418]/15">
            <span className="font-semibold text-[#101418]">
              DECODED: {loadedCount} / {totalCritical}
            </span>
            <span className="text-[#124ead] font-bold">
              WEBP (90% PAYLOAD SAVED)
            </span>
            <span className={fontsReady ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
              FONTS: {fontsReady ? "READY" : "LOADING"}
            </span>
          </div>
        </div>

        {/* Title Block Bottom Annotation */}
        <div className="mt-8 pt-4 border-t border-[#101418]/20 flex items-center gap-4 text-[10px] font-mono text-[#5c6470]">
          <span>DWG: MNF-2026-HERO</span>
          <span>•</span>
          <span>SCALE: 1:1</span>
          <span>•</span>
          <span>AUTONOMOUS ENGINE</span>
        </div>
      </div>
    </div>
  );
}
export default BlueprintLoader;

