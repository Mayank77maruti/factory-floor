"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";

/**
 * ExploreFrontlineMode
 *
 * Immersive scroll-driven storytelling showcase for Frontline Mode:
 * - Central Frontline Engineer Girl with tablet placed in the exact dead center of the stage.
 * - 6 contextual UI cards (Connected Systems, Files, Conversations, Docs, Data Records, Updates)
 *   physically emerge out from behind her on scroll, fanning outward cleanly into balanced orbits.
 * - Clean emergence physics: cards start tiny (scale: 0.15) and hidden (opacity: 0) directly behind her tablet,
 *   expanding and gliding outward cleanly as scroll progresses.
 * - Fully reversible upon scrolling upward.
 */
const ROTATING_WORDS = [
  { text: "work", bg: "#1E43D8", color: "#FFFFFF" },
  { text: "fixing", bg: "#FF6B2C", color: "#FFFFFF" },
  { text: "planning", bg: "#3E6BE0", color: "#FFFFFF" },
  { text: "action", bg: "#FFC53D", color: "#101418" },
];

export function ExploreFrontlineMode() {
  const containerRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1440);

  // Rotating Word State (mirrors frontline chat page text rotation)
  const [wordIndex, setWordIndex] = useState(0);
  const [pillWidth, setPillWidth] = useState<number | undefined>(undefined);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Check user preference for reduced motion and screen width
  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportWidth(window.innerWidth);
      const handleResize = () => setViewportWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);

      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);

      return () => {
        window.removeEventListener("resize", handleResize);
        mediaQuery.removeEventListener("change", listener);
      };
    }
  }, []);

  // Measure word widths and update pill width for rotating headline
  useEffect(() => {
    const updateWidth = () => {
      const activeSpan = wordRefs.current[wordIndex];
      if (activeSpan) {
        setPillWidth(activeSpan.offsetWidth + 28);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(updateWidth);
    }
    return () => window.removeEventListener("resize", updateWidth);
  }, [wordIndex]);

  // Rotate words every 1800ms
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Scrub scroll progress deterministically between 0.0 and 1.0
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) {
            ticking = false;
            return;
          }

          const rect = containerRef.current.getBoundingClientRect();
          const totalDistance = rect.height - window.innerHeight;

          if (totalDistance <= 0) {
            setScrollProgress(0);
            ticking = false;
            return;
          }

          const scrolled = -rect.top;
          const rawProgress = scrolled / totalDistance;
          const clamped = Math.max(0, Math.min(1, rawProgress));
          setScrollProgress(clamped);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const p = prefersReducedMotion ? 0.85 : scrollProgress;


  // Central Operator always fully visible in center
  const operatorOpacity = 1;

  const operatorTranslateY = useMemo(() => {
    if (p < 0.12) return (1 - p / 0.12) * 16;
    return 0;
  }, [p]);

  const operatorScale = useMemo(() => {
    return 1 + (p - 0.5) * 0.02;
  }, [p]);

  // Responsive spread scale multiplier for horizontal card offsets
  const spreadScale = useMemo(() => {
    if (viewportWidth < 640) return 0.50;
    if (viewportWidth < 768) return 0.65;
    if (viewportWidth < 1024) return 0.82;
    if (viewportWidth < 1280) return 0.94;
    if (viewportWidth < 1536) return 1.05;
    return 1.18; // wide screen (1920px+)
  }, [viewportWidth]);

  // =========================================================================
  // CLEAN EMERGENCE CALCULATIONS: CARDS EMERGE OUT FROM BEHIND HER
  // =========================================================================

  // Smooth ease helper (starts from her center, accelerates smoothly outward)
  const calcEmergence = (startP: number, endP: number) => {
    if (p < startP) return { t: 0, opacity: 0, scale: 0.15 };
    if (p >= endP) return { t: 1, opacity: 1, scale: 1 };
    
    const progress = (p - startP) / (endP - startP);
    // Smooth cubic ease-out
    const t = 1 - Math.pow(1 - progress, 2.5);
    // Opacity fades in cleanly as the card clears her silhouette
    const opacity = Math.min(1, progress * 2.2);
    // Scale blooms from 0.15 up to 1.0
    const scale = 0.15 + t * 0.85;

    return { t, opacity, scale };
  };

  // 1. Card Upper-Left: Connected Systems (Emerges ↖ from her tablet)
  const c1 = calcEmergence(0.10, 0.42);
  const c1X = c1.t * -490 * spreadScale;
  const c1Y = c1.t * -215 * spreadScale;

  // 2. Card Middle-Left: Active Issues & Drift (Emerges ◄ directly left from her)
  const c2 = calcEmergence(0.20, 0.52);
  const c2X = c2.t * -535 * spreadScale;
  const c2Y = c2.t * -28 * spreadScale;

  // 3. Card Lower-Left: Copilot Dialog (Emerges ↙ down-left from her)
  const c3 = calcEmergence(0.28, 0.62);
  const c3X = c3.t * -490 * spreadScale;
  const c3Y = c3.t * 208 * spreadScale;

  // 4. Card Upper-Right: Docs & SOP Checklist (Emerges ↗ from her tablet)
  const c4 = calcEmergence(0.12, 0.44);
  const c4X = c4.t * 490 * spreadScale;
  const c4Y = c4.t * -215 * spreadScale;

  // 5. Card Middle-Right: Data Records & Telemetry (Emerges ► directly right from her)
  const c5 = calcEmergence(0.22, 0.54);
  const c5X = c5.t * 535 * spreadScale;
  const c5Y = c5.t * -25 * spreadScale;

  // 6. Card Lower-Right: Operational Updates (Emerges ↘ down-right from her)
  const c6 = calcEmergence(0.30, 0.64);
  const c6X = c6.t * 490 * spreadScale;
  const c6Y = c6.t * 208 * spreadScale;

  // Connecting SVG lines opacity (fades in as cards expand outward)
  const linesOpacity = useMemo(() => {
    if (p < 0.30) return 0;
    if (p < 0.48) return (p - 0.30) / 0.18;
    if (p < 0.88) return 0.55;
    return Math.max(0, 0.55 * (1 - (p - 0.88) / 0.12));
  }, [p]);

  return (
    <section
      ref={containerRef}
      id="explore-frontline-mode"
      className="relative w-full h-[340vh] lg:h-[390vh] bg-[#f4ebd7] border-t-2 border-[#101418]"
    >
      {/* PINNED VIEWPORT: 100vh Sticky Viewport */}
      <div className="sticky top-0 w-full h-[100dvh] overflow-hidden flex flex-col justify-between select-none">
        
        {/* =================================================================== */}
        {/* EDITORIAL HEADLINE                                                  */}
        {/* =================================================================== */}
        <div className="relative w-full max-w-5xl mx-auto text-center z-30 pt-16 sm:pt-20 lg:pt-22 pb-2 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-[#101418] leading-[1.08] select-none">
            Intelligence where the{" "}
            {prefersReducedMotion ? (
              <span
                className="inline-block px-3 py-0.5 rounded-[10px] border-2 border-[#101418] align-bottom"
                style={{
                  backgroundColor: ROTATING_WORDS[0].bg,
                  color: ROTATING_WORDS[0].color,
                }}
              >
                <span>{ROTATING_WORDS[0].text}</span>
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="inline-block relative rounded-[10px] border-2 border-[#101418] transition-[width,background-color,color] duration-700 ease-in-out align-bottom"
                style={{
                  height: "1.22em",
                  verticalAlign: "bottom",
                  width: pillWidth ? `${pillWidth}px` : "auto",
                  minWidth: "2.2em",
                  backgroundColor: ROTATING_WORDS[wordIndex].bg,
                  color: ROTATING_WORDS[wordIndex].color,
                }}
              >
                {/* Hidden measuring spans */}
                <span
                  className="invisible absolute top-0 left-0 pointer-events-none select-none"
                  aria-hidden="true"
                >
                  {ROTATING_WORDS.map((w, i) => (
                    <span
                      key={`measure-${w.text}`}
                      ref={(el) => {
                        wordRefs.current[i] = el;
                      }}
                      className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] tracking-tight whitespace-nowrap inline-block"
                    >
                      {w.text}
                    </span>
                  ))}
                </span>

                {/* Rotating Word Sliders */}
                {ROTATING_WORDS.map((w, i) => {
                  const isCurrent = i === wordIndex;
                  const isNext = i === (wordIndex + 1) % ROTATING_WORDS.length;

                  let transform = "translate(-50%, -105%)";
                  let opacity = 0;

                  if (isCurrent) {
                    transform = "translate(-50%, 0)";
                    opacity = 1;
                  } else if (isNext) {
                    transform = "translate(-50%, 105%)";
                    opacity = 0;
                  }

                  return (
                    <span
                      key={w.text}
                      className="absolute left-1/2 whitespace-nowrap pointer-events-none select-none transition-transform duration-700 ease-in-out"
                      style={{
                        transform,
                        opacity,
                        transitionProperty: "transform, opacity",
                        transitionDuration: "0.7s, 0.25s",
                        transitionDelay: isCurrent ? "0s, 0.25s" : "0s, 0s",
                        lineHeight: "1.18em",
                        bottom: "0.02em",
                      }}
                    >
                      {w.text}
                    </span>
                  );
                })}
              </span>
            )}
            {" "}happens.
          </h2>
        </div>

        {/* =================================================================== */}
        {/* MAIN STAGE: DEAD-CENTER ENGINEER GIRL + CARDS EMERGING FROM HER     */}
        {/* =================================================================== */}
        <div className="relative w-full flex-1 max-w-[1720px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-center my-auto overflow-hidden">
          
          {/* Subtle Ambient Technical Rings & Aura Behind Her */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-[#101418]/12 border-dashed pointer-events-none z-5" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full border border-[#1E43D8]/10 border-dashed pointer-events-none z-5 hidden sm:block" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-[#1E43D8]/6 blur-3xl pointer-events-none z-5" />

          {/* ----------------------------------------------------------------- */}
          {/* SUBTLE CONNECTING TELEMETRY SVG MESH                              */}
          {/* ----------------------------------------------------------------- */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 z-15 hidden md:block"
            style={{ opacity: linesOpacity }}
          >
            <defs>
              <linearGradient id="ray-left" x1="50%" y1="50%" x2="20%" y2="50%">
                <stop offset="0%" stopColor="#1E43D8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#1E43D8" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="ray-right" x1="50%" y1="50%" x2="80%" y2="50%">
                <stop offset="0%" stopColor="#ff5500" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ff5500" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Subtle connecting rays linking her tablet to the floating cards */}
            <line x1="50%" y1="50%" x2={`calc(50% + ${c1X}px)`} y2={`calc(50% + ${c1Y}px)`} stroke="url(#ray-left)" strokeWidth="1.2" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2={`calc(50% + ${c2X}px)`} y2={`calc(50% + ${c2Y}px)`} stroke="url(#ray-left)" strokeWidth="1.2" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2={`calc(50% + ${c3X}px)`} y2={`calc(50% + ${c3Y}px)`} stroke="url(#ray-left)" strokeWidth="1.2" strokeDasharray="4 4" />

            <line x1="50%" y1="50%" x2={`calc(50% + ${c4X}px)`} y2={`calc(50% + ${c4Y}px)`} stroke="url(#ray-right)" strokeWidth="1.2" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2={`calc(50% + ${c5X}px)`} y2={`calc(50% + ${c5Y}px)`} stroke="url(#ray-right)" strokeWidth="1.2" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2={`calc(50% + ${c6X}px)`} y2={`calc(50% + ${c6Y}px)`} stroke="url(#ray-right)" strokeWidth="1.2" strokeDasharray="4 4" />
          </svg>

          {/* ================================================================= */}
          {/* THE 6 FLOATING CARDS: PHYSICALLY BEHIND HER (Z-INDEX 20)          */}
          {/* ================================================================= */}

          {/* ----------------------------------------------------------------- */}
          {/* CARD 1: UPPER-LEFT — CONNECTED SYSTEMS & INTEGRATIONS             */}
          {/* ----------------------------------------------------------------- */}
          <div
            className="absolute left-1/2 top-1/2 z-20 pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(calc(-50% + ${c1X}px), calc(-50% + ${c1Y}px)) scale(${c1.scale})`,
              opacity: c1.opacity,
              pointerEvents: c1.t > 0.4 ? "auto" : "none",
            }}
          >
            <div className="w-[270px] sm:w-[315px] md:w-[335px] xl:w-[365px] bg-[#FFFBF0] border-[1.5px] border-[#101418] rounded-[10px] p-3.5 sm:p-4 shadow-[4px_4px_0_#101418] hover:shadow-[6px_6px_0_#101418] hover:-translate-y-0.5 transition-all text-left">
              <div className="flex items-center justify-between border-b border-[#101418]/15 pb-2 mb-2.5 font-mono text-[10px] sm:text-[11px]">
                <span className="font-bold text-[#ff5500] flex items-center gap-2 uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5500] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff5500]" />
                  </span>
                  CONNECTED SYSTEMS
                </span>
                <span className="bg-[#DCFCE7] text-[#15803D] font-bold px-2 py-0.5 rounded-[4px] border border-[#16A34A]/30 text-[9.5px] sm:text-[10px] flex items-center gap-1">
                  ● 24 NODES ONLINE
                </span>
              </div>
              
              <div className="flex items-center gap-2 py-1">
                <div className="px-2.5 py-1 rounded-[4px] bg-[#1E43D8] font-mono font-bold text-white text-[10px] sm:text-[11px] shadow-[1px_1px_0_#101418] flex items-center gap-1">
                  VERTEX AI
                </div>
                <div className="px-2.5 py-1 rounded-[4px] bg-[#ff5500] font-mono font-bold text-white text-[10px] sm:text-[11px] shadow-[1px_1px_0_#101418] flex items-center gap-1">
                  FANUC CNC
                </div>
                <div className="px-2.5 py-1 rounded-[4px] bg-[#16A34A] font-mono font-bold text-white text-[10px] sm:text-[11px] shadow-[1px_1px_0_#101418] flex items-center gap-1">
                  SCADA
                </div>
                <div className="px-2 py-1 rounded-[4px] bg-[#101418] font-mono font-bold text-white text-[9.5px] sm:text-[10.5px] shadow-[1px_1px_0_#101418]">
                  +18
                </div>
              </div>

              <div className="border-t border-[#101418]/10 pt-2 mt-2 flex items-center justify-between text-[9.5px] sm:text-[10px] font-mono text-[#5c6470]">
                <span>Low-latency edge bus synchronized</span>
                <span className="text-[#15803D] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  4.2 ms
                </span>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* CARD 2: MIDDLE-LEFT — ACTIVE ISSUES & DRIFT MONITORING            */}
          {/* ----------------------------------------------------------------- */}
          <div
            className="absolute left-1/2 top-1/2 z-20 pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(calc(-50% + ${c2X}px), calc(-50% + ${c2Y}px)) scale(${c2.scale})`,
              opacity: c2.opacity,
              pointerEvents: c2.t > 0.4 ? "auto" : "none",
            }}
          >
            <div className="w-[280px] sm:w-[330px] md:w-[355px] xl:w-[385px] bg-[#FFFBF0] border-[1.5px] border-[#101418] rounded-[10px] p-3.5 sm:p-4 shadow-[4px_4px_0_#101418] hover:shadow-[6px_6px_0_#101418] hover:-translate-y-0.5 transition-all text-left">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#101418]/15 pb-2 mb-2 font-mono text-[10px] sm:text-[11px]">
                <span className="font-bold text-[#101418] flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20] animate-ping" />
                  ACTIVE ISSUES &amp; DRIFT
                </span>
                <span className="bg-[#FEE4E2] text-[#D92D20] font-bold px-2 py-0.5 rounded-[4px] border border-[#D92D20]/30 text-[9px] sm:text-[10px]">
                  2 UNREPORTED
                </span>
              </div>

              {/* Frontline Chat Context Trigger */}
              <div className="flex items-center justify-between bg-[#101418]/5 px-2.5 py-1 rounded-[5px] border border-[#101418]/10 mb-2 font-mono text-[9px] sm:text-[10px]">
                <div className="flex items-center gap-1.5 truncate text-[#101418]">
                  <span className="text-[#1E43D8] font-bold shrink-0">Q:</span>
                  <span className="italic truncate font-medium">“Any equipment drifting?”</span>
                </div>
                <span className="text-[#D92D20] font-bold text-[8.5px] sm:text-[9px] shrink-0 ml-1.5 bg-[#FEE4E2] px-1.5 py-0.5 rounded border border-[#D92D20]/25">
                  ● FLAGGED
                </span>
              </div>

              {/* Active Drift Issues List */}
              <div className="space-y-2 font-mono text-[9.5px] sm:text-[10.5px]">
                {/* Issue 1: Press 3 Thermal Drift */}
                <div className="bg-[#F6EFDB] hover:bg-[#F2E7CD] p-2.5 rounded-[6px] border border-[#101418]/15 transition-colors">
                  <div className="flex items-center justify-between font-bold text-[#101418]">
                    <span>Press 3 · Line 2</span>
                    <span className="bg-[#FEE4E2] text-[#D92D20] text-[8.5px] sm:text-[9px] px-1.5 py-0.5 rounded border border-[#D92D20]/30">
                      +13° DRIFT
                    </span>
                  </div>
                  <div className="text-[9px] sm:text-[9.5px] text-[#5c6470] mt-1 leading-snug">
                    Hydraulic temp over spec · W-3318 (Started 09:12)
                  </div>
                </div>

                {/* Issue 2: Engine Line 2 Bracket Loosening */}
                <div className="bg-[#F6EFDB] hover:bg-[#F2E7CD] p-2.5 rounded-[6px] border border-[#101418]/15 transition-colors">
                  <div className="flex items-center justify-between font-bold text-[#101418]">
                    <span>Engine Line 2</span>
                    <span className="bg-[#FFEDD5] text-[#C2410C] text-[8.5px] sm:text-[9px] px-1.5 py-0.5 rounded border border-[#ff5500]/30">
                      BOLTS LOOSE
                    </span>
                  </div>
                  <div className="text-[9px] sm:text-[9.5px] text-[#5c6470] mt-1 leading-snug">
                    Torque 6 bolts to 45 N·m · W-3321 (Due 14:00)
                  </div>
                </div>
              </div>

              {/* Bottom status footer */}
              <div className="border-t border-[#101418]/10 pt-2 mt-2 flex items-center justify-between text-[9.5px] sm:text-[10px] font-mono text-[#5c6470]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500]" />
                  Immediate inspection required
                </span>
                <span className="text-[#D92D20] font-bold">2 ALERTS</span>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* CARD 3: LOWER-LEFT — FRONTLINE COPILOT CONVERSATIONS              */}
          {/* ----------------------------------------------------------------- */}
          <div
            className="absolute left-1/2 top-1/2 z-20 pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(calc(-50% + ${c3X}px), calc(-50% + ${c3Y}px)) scale(${c3.scale})`,
              opacity: c3.opacity,
              pointerEvents: c3.t > 0.4 ? "auto" : "none",
            }}
          >
            <div className="w-[280px] sm:w-[330px] md:w-[355px] xl:w-[385px] bg-[#FFFBF0] border-[1.5px] border-[#101418] rounded-[10px] p-3.5 sm:p-4 shadow-[4px_4px_0_#101418] hover:shadow-[6px_6px_0_#101418] hover:-translate-y-0.5 transition-all text-left">
              <div className="flex items-center justify-between border-b border-[#101418]/15 pb-2 mb-2.5 font-mono text-[10px] sm:text-[11px]">
                <span className="font-bold text-[#1E43D8] flex items-center gap-2 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
                  FRONTLINE COPILOT
                </span>
                <span className="text-[#5c6470] bg-[#101418]/5 px-2 py-0.5 rounded border border-[#101418]/10 text-[9.5px] sm:text-[10px]">
                  10:14 AM // SHIFT 1
                </span>
              </div>

              <div className="bg-[#F6EFDB] border border-[#101418]/15 rounded-[6px] p-2.5 mb-2">
                <div className="flex items-center justify-between font-mono text-[9.5px] sm:text-[10px] font-bold text-[#101418] mb-1">
                  <span>👤 Elena (Frontline Tech)</span>
                  <span className="text-[#5c6470] font-normal text-[8.5px]">CNC Bay 4</span>
                </div>
                <div className="text-[10.5px] sm:text-[11.5px] text-[#101418] font-mono leading-snug">
                  “Spindle vibration on Unit 04 drifted +0.018 mm above baseline.”
                </div>
              </div>

              <div className="bg-[#1E43D8]/8 border border-[#1E43D8]/25 rounded-[6px] p-2.5">
                <div className="flex items-center justify-between font-mono text-[9.5px] sm:text-[10px] font-bold text-[#1E43D8] mb-1">
                  <span>⚡ Astraea Copilot</span>
                  <span className="text-[#1E43D8]/70 font-normal text-[8.5px]">AI Agent</span>
                </div>
                <div className="text-[10.5px] sm:text-[11.5px] text-[#101418] font-mono leading-snug">
                  “Matched past record W-3318. Bearing preload check recommended below.”
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* CARD 4: UPPER-RIGHT — DOCS & SOP CHECKLIST PROCEDURE              */}
          {/* ----------------------------------------------------------------- */}
          <div
            className="absolute left-1/2 top-1/2 z-20 pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(calc(-50% + ${c4X}px), calc(-50% + ${c4Y}px)) scale(${c4.scale})`,
              opacity: c4.opacity,
              pointerEvents: c4.t > 0.4 ? "auto" : "none",
            }}
          >
            <div className="w-[270px] sm:w-[320px] md:w-[340px] xl:w-[370px] bg-[#FFFBF0] border-[1.5px] border-[#101418] rounded-[10px] p-3.5 sm:p-4 shadow-[4px_4px_0_#101418] hover:shadow-[6px_6px_0_#101418] hover:-translate-y-0.5 transition-all text-left">
              <div className="flex items-center justify-between border-b border-[#101418]/15 pb-2 mb-2.5 font-mono text-[10px] sm:text-[11px]">
                <span className="font-bold text-[#101418] flex items-center gap-1.5 uppercase tracking-wider">
                  <span>📄</span> SOP PROCEDURE
                </span>
                <span className="bg-[#DCFCE7] text-[#15803D] font-bold px-2 py-0.5 rounded-[4px] border border-[#16A34A]/30 text-[9.5px] sm:text-[10px]">
                  ✓ SOP #402 VERIFIED
                </span>
              </div>

              <div className="flex items-center justify-between font-mono text-[11px] sm:text-[12px] font-bold text-[#101418] mb-2">
                <span>Spindle Maintenance Protocol</span>
                <span className="text-[9px] text-[#5c6470] font-normal">Step 2 of 3</span>
              </div>

              <div className="space-y-1.5 font-mono text-[10px] sm:text-[11px]">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-[4px] bg-[#DCFCE7]/40 border border-[#16A34A]/20 text-[#15803D] font-semibold">
                  <span className="text-[#16A34A] font-bold text-xs">☑</span>
                  <span>Verify spindle runout ≤ 0.004 mm</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-[4px] bg-[#DCFCE7]/40 border border-[#16A34A]/20 text-[#15803D] font-semibold">
                  <span className="text-[#16A34A] font-bold text-xs">☑</span>
                  <span>Check hydraulic temp (&lt;55°C)</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-[4px] bg-[#E8EEFC] border border-[#1E43D8]/25 text-[#1E43D8] font-bold">
                  <span className="text-[#1E43D8] font-bold text-xs">☐</span>
                  <span>Torque flange to 42 N·m (ASME)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* CARD 5: MIDDLE-RIGHT — DATA RECORDS & LIVE TELEMETRY              */}
          {/* ----------------------------------------------------------------- */}
          <div
            className="absolute left-1/2 top-1/2 z-20 pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(calc(-50% + ${c5X}px), calc(-50% + ${c5Y}px)) scale(${c5.scale})`,
              opacity: c5.opacity,
              pointerEvents: c5.t > 0.4 ? "auto" : "none",
            }}
          >
            <div className="w-[270px] sm:w-[320px] md:w-[345px] xl:w-[375px] bg-[#FFFBF0] border-[1.5px] border-[#101418] rounded-[10px] p-3.5 sm:p-4 shadow-[4px_4px_0_#101418] hover:shadow-[6px_6px_0_#101418] hover:-translate-y-0.5 transition-all text-left">
              <div className="flex items-center justify-between border-b border-[#101418]/15 pb-2 mb-2.5 font-mono text-[10px] sm:text-[11px]">
                <span className="font-bold text-[#101418] flex items-center gap-1.5 uppercase tracking-wider">
                  <span>📊</span> DATA RECORDS
                </span>
                <span className="bg-[#FFEDD5] text-[#C2410C] font-bold px-2 py-0.5 rounded-[4px] border border-[#ff5500]/30 text-[9.5px] sm:text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="bg-[#F6EFDB] border border-[#101418]/15 rounded-[6px] p-2.5 sm:p-3 mb-2 space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px]">
                  <span className="text-[#5c6470] font-medium">Unit 04 Spindle Drift</span>
                  <span className="font-bold text-[#C2410C] bg-[#FFEDD5] px-1.5 py-0.5 rounded border border-[#ff5500]/25">
                    4.8 mm/s [DRIFT]
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px]">
                  <span className="text-[#5c6470] font-medium">Process Cpk Index</span>
                  <span className="font-bold text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded border border-[#16A34A]/25">
                    1.82 6σ [NOMINAL]
                  </span>
                </div>
              </div>

              <div className="font-mono text-[9.5px] sm:text-[10px] text-[#15803D] font-bold flex items-center justify-between pt-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  Bearing acoustic profile matching baseline
                </span>
                <span className="text-[#5c6470] font-normal text-[8.5px]">99.4%</span>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* CARD 6: LOWER-RIGHT — OPERATIONAL UPDATES & DISPATCH              */}
          {/* ----------------------------------------------------------------- */}
          <div
            className="absolute left-1/2 top-1/2 z-20 pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(calc(-50% + ${c6X}px), calc(-50% + ${c6Y}px)) scale(${c6.scale})`,
              opacity: c6.opacity,
              pointerEvents: c6.t > 0.4 ? "auto" : "none",
            }}
          >
            <div className="w-[280px] sm:w-[330px] md:w-[355px] xl:w-[385px] bg-[#FFFBF0] border-[1.5px] border-[#101418] rounded-[10px] p-3.5 sm:p-4 shadow-[4px_4px_0_#101418] hover:shadow-[6px_6px_0_#101418] hover:-translate-y-0.5 transition-all text-left">
              <div className="flex items-center justify-between border-b border-[#101418]/15 pb-2 mb-2.5 font-mono text-[10px] sm:text-[11px]">
                <span className="font-bold text-[#101418] flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🔔</span> UPDATES &amp; DISPATCH
                </span>
                <span className="bg-[#DCFCE7] text-[#15803D] font-bold px-2 py-0.5 rounded-[4px] border border-[#16A34A]/30 text-[9.5px] sm:text-[10px]">
                  TICKET W-3318
                </span>
              </div>

              <div className="flex items-start gap-2.5 bg-[#F6EFDB] border border-[#101418]/15 rounded-[6px] p-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1E43D8] text-white flex items-center justify-center font-mono text-[10px] font-bold shrink-0 shadow-sm border border-[#101418]/20 mt-0.5">
                  DS
                </div>
                <div>
                  <div className="flex items-center gap-2 font-mono text-[9.5px] sm:text-[10px] font-bold text-[#101418]">
                    <span>Devin (Shift Lead)</span>
                    <span className="text-[8.5px] text-[#5c6470] font-normal">10:18 AM</span>
                  </div>
                  <div className="text-[10.5px] sm:text-[11.5px] text-[#333a44] font-mono leading-snug mt-0.5">
                    Bearing replacement approved. Tool Crib B parts staged for shift change.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#101418]/10 pt-2 font-mono text-[9.5px] sm:text-[10px]">
                <span className="text-[#5c6470] hover:text-[#101418] cursor-pointer flex items-center gap-1">
                  👍 Acknowledged by Elena
                </span>
                <span className="bg-[#DCFCE7] text-[#15803D] font-bold px-2 py-0.5 rounded border border-[#16A34A]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  DISPATCH READY
                </span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CENTRAL INDUSTRIAL ENGINEER GIRL WITH TABLET (DEAD CENTER Z-30)   */}
          {/* ================================================================= */}
          <div
            className="absolute left-1/2 top-1/2 z-30 pointer-events-auto flex flex-col items-center justify-center select-none"
            style={{
              opacity: operatorOpacity,
              transform: `translate(-50%, calc(-50% + ${operatorTranslateY}px)) scale(${operatorScale})`,
              transformOrigin: "center center",
            }}
          >
            {/* Ambient Ground Shadow Under Her Boots */}
            <div className="absolute -bottom-2 w-52 sm:w-64 lg:w-72 h-7 bg-[#101418]/25 rounded-full blur-md pointer-events-none" />

            {/* Engineer Girl Figure (Responsive WebP with PNG fallback & lazy loading) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <picture>
              <source
                type="image/webp"
                srcSet="/frontline/frontline-operator-480w.webp 480w, /frontline/frontline-operator-768w.webp 768w, /frontline/frontline-operator.webp 1024w"
                sizes="(max-width: 640px) 480px, (max-width: 1024px) 768px, 1024px"
              />
              <source
                type="image/png"
                srcSet="/frontline/frontline-operator-480w.png 480w, /frontline/frontline-operator-768w.png 768w, /frontline/frontline-operator.png 1024w"
                sizes="(max-width: 640px) 480px, (max-width: 1024px) 768px, 1024px"
              />
              <img
                src="/frontline/frontline-operator.png"
                alt="Industrial Engineer with Tablet standing in the center"
                loading="lazy"
                decoding="async"
                className="h-[52vh] sm:h-[58vh] md:h-[64vh] lg:h-[70vh] max-h-[620px] xl:max-h-[680px] w-auto object-contain filter drop-shadow-[0_12px_24px_rgba(16,20,24,0.22)] select-none pointer-events-none"
                draggable={false}
              />
            </picture>

            {/* Anchored Identity Badge */}
            <div className="relative -mt-5 z-40 bg-[#FFFBF0]/95 border-[1.5px] border-[#101418] rounded-[6px] px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-[3px_3px_0_#101418] backdrop-blur-[2px] flex items-center gap-2.5 font-mono text-[9.5px] sm:text-[10.5px]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
              <span className="font-bold text-[#101418]">ELENA R. // INDUSTRIAL OPERATIONS</span>
              <span className="text-[#101418]/30">|</span>
              <span className="text-[#1E43D8] font-bold">CNC BAY 4</span>
              <span className="text-[#101418]/30">|</span>
              <span className="text-[#ff5500] font-bold">ASME Y14.5 SYNC</span>
            </div>
          </div>

        </div>

        {/* =================================================================== */}
        {/* BOTTOM DELIBERATE STRIP: SECTION LABEL + STORY PROGRESS + CTA       */}
        {/* =================================================================== */}
        <div className="relative w-full z-40 bg-[#FFFBF0]/90 border-t border-[#101418]/20 backdrop-blur-sm px-4 sm:px-8 md:px-12 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          
          {/* Left Supporting Annotation */}
          <div className="flex items-center gap-2 text-[#5c6470]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
            <span className="font-bold text-[#101418]">FRONTLINE MODE ACTIVE</span>
            <span className="text-[#101418]/30">|</span>
            <span className="font-handwriting text-sm sm:text-base text-[#101418] font-bold select-none">
              ↳ connected shop-floor intelligence
            </span>
          </div>

          {/* Right Progress Counter + CTA Button */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 text-[#5c6470] text-[11px]">
              <span>STORY PROGRESS:</span>
              <span className="font-bold text-[#ff5500]">
                {Math.round(scrollProgress * 100)}%
              </span>
            </div>

            <Link
              href="/frontline"
              className="group inline-flex items-center gap-2 bg-[#ff5500] hover:bg-[#e04a00] text-white font-bold text-xs sm:text-sm py-2 px-5 rounded-[4px] border-2 border-[#101418] shadow-[3px_3px_0_#101418] hover:shadow-[4px_4px_0_#101418] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Explore Frontline Mode</span>
              <span className="text-white text-sm group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

export default ExploreFrontlineMode;
