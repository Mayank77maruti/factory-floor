"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PlatformModeModal from "./PlatformModeModal";
import BlueprintLoader from "./BlueprintLoader";
import { AstraeaLogo } from "./AstraeaLogo";

// =========================================================================
// 1. FULL-SCREEN SCROLL CANVAS COMPONENT (Asset-Gated & WebP-Accelerated)
// =========================================================================
function FullScreenCanvas({
  totalFrames = 300,
  isRevealed = false,
  onCriticalProgress,
  onCriticalComplete,
}: {
  totalFrames?: number;
  isRevealed?: boolean;
  onCriticalProgress?: (loadedCount: number, total: number) => void;
  onCriticalComplete?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation & Frame tracking references
  const currentFrameRef = useRef<number>(1);
  const targetFrameRef = useRef<number>(1);
  const lastDrawnFrameRef = useRef<number>(-1);
  const needsRedrawRef = useRef<boolean>(true);
  const rafIdRef = useRef<number | null>(null);

  const onCriticalProgressRef = useRef(onCriticalProgress);
  onCriticalProgressRef.current = onCriticalProgress;
  const onCriticalCompleteRef = useRef(onCriticalComplete);
  onCriticalCompleteRef.current = onCriticalComplete;

  // Frame Cache
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedFlagsRef = useRef<boolean[]>([]);

  // Serve .webp first, fall back to .png on error
  const getFrameUrls = (index: number) => {
    const padded = index.toString().padStart(3, "0");
    return {
      webp: `/images/ezgif-frame-${padded}.webp`,
      png: `/images/ezgif-frame-${padded}.png`,
    };
  };

  // Find closest loaded image if target frame is still decoding
  const getClosestImage = (targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    const loaded = loadedFlagsRef.current;

    if (loaded[targetIndex] && images[targetIndex]) {
      return images[targetIndex];
    }

    for (let offset = 1; offset < totalFrames; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 1 && loaded[prev] && images[prev]) return images[prev];
      const next = targetIndex + offset;
      if (next <= totalFrames && loaded[next] && images[next]) return images[next];
    }

    return null;
  };

  // Draw frame on canvas with aspect ratio cover & retina DPR capped at 2
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const img = getClosestImage(frameIndex);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width === 0 || height === 0) return;

    const targetW = Math.floor(width * dpr);
    const targetH = Math.floor(height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Dynamically align canvas framing with the bottom of the hero paper banner
    // so the architect's head and workstation sit right underneath the banner dividing line
    const heroBanner = typeof document !== "undefined" ? document.getElementById("hero-headline-banner") : null;
    const bannerH = heroBanner ? heroBanner.getBoundingClientRect().height : height * 0.478;

    const headImgY = 466; // Top apex of architect's head/hair in 1080p source image
    const desiredHeadY = bannerH + 6; // Sit cleanly 6px below bottom paper border

    let scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);

    if (desiredHeadY / headImgY > scale) {
      scale = desiredHeadY / headImgY;
    }

    let offsetY = desiredHeadY - scale * headImgY;

    if (offsetY > 0) offsetY = 0;
    if (offsetY + scale * img.naturalHeight < height) {
      offsetY = height - scale * img.naturalHeight;
    }

    const renderW = Math.ceil(scale * img.naturalWidth);
    const renderH = Math.ceil(scale * img.naturalHeight);
    const offsetX = Math.floor((width - renderW) / 2);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
    ctx.restore();
  };

  // Progressive asset-gated preloader (WebP first with PNG fallback)
  useEffect(() => {
    imagesRef.current = new Array(totalFrames + 1).fill(null);
    loadedFlagsRef.current = new Array(totalFrames + 1).fill(false);

    let isMounted = true;

    const loadSingleFrame = (idx: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        if (imagesRef.current[idx] && loadedFlagsRef.current[idx]) {
          resolve(imagesRef.current[idx]!);
          return;
        }

        const { webp, png } = getFrameUrls(idx);
        const img = new Image();

        const handleSuccess = () => {
          if (!isMounted) return;
          imagesRef.current[idx] = img;
          loadedFlagsRef.current[idx] = true;

          if (idx === 1) {
            drawFrame(1);
            needsRedrawRef.current = true;
          }
          resolve(img);
        };

        img.onload = () => {
          if ("decode" in img) {
            img.decode().then(handleSuccess).catch(handleSuccess);
          } else {
            handleSuccess();
          }
        };

        img.onerror = () => {
          // Serve .webp first, fall back to .png on error
          if (img.src.includes(".webp")) {
            img.src = png;
          } else {
            resolve(img);
          }
        };

        img.src = webp;
      });
    };

    const preloadSequence = async () => {
      // Expanded critical set: frames 001–025 PLUS every 10th frame (030, 040, … 300) = 53 frames
      const CRITICAL_TOTAL = 53;
      let criticalLoaded = 0;

      // Priority 1: Load Frame 1 immediately
      await loadSingleFrame(1);
      if (!isMounted) return;
      drawFrame(1);
      criticalLoaded++;
      onCriticalProgressRef.current?.(criticalLoaded, CRITICAL_TOTAL);

      // Priority 2: Preload next 24 critical frames (002 to 025) PLUS every 10th frame (030 to 300)
      const criticalIndices: number[] = [];
      for (let i = 2; i <= Math.min(25, totalFrames); i++) {
        criticalIndices.push(i);
      }
      for (let i = 30; i <= totalFrames; i += 10) {
        criticalIndices.push(i);
      }

      const criticalPromises = criticalIndices.map((idx) =>
        loadSingleFrame(idx).then(() => {
          if (!isMounted) return;
          criticalLoaded++;
          onCriticalProgressRef.current?.(criticalLoaded, CRITICAL_TOTAL);
        })
      );

      await Promise.all(criticalPromises);
      if (!isMounted) return;

      // Reveal gate: All 53 critical anchor frames are fully decoded before reveal!
      onCriticalCompleteRef.current?.();

      // Priority 3: Post-reveal background fill for remaining frames (6-wide batches)
      const remaining: number[] = [];
      for (let i = 1; i <= totalFrames; i++) {
        if (!loadedFlagsRef.current[i]) remaining.push(i);
      }

      const batchSize = 6;
      for (let i = 0; i < remaining.length; i += batchSize) {
        if (!isMounted) return;
        await Promise.all(remaining.slice(i, i + batchSize).map(loadSingleFrame));
      }
    };

    preloadSequence();

    return () => {
      isMounted = false;
    };
  }, [totalFrames]);

  // Scroll listener & continuous Lerp animation loop (GATED ON isRevealed)
  useEffect(() => {
    // While the loader is up: do NOT start the scroll-driven rAF sequence loop!
    if (!isRevealed) return;

    needsRedrawRef.current = true;
    drawFrame(1);

    const handleScroll = () => {
      const scrollTrack = document.getElementById("scroll-story-track");
      let progress = 0;

      if (scrollTrack) {
        const rect = scrollTrack.getBoundingClientRect();
        const totalDist = rect.height - window.innerHeight;
        if (totalDist > 0) {
          const scrolled = -rect.top;
          progress = Math.max(0, Math.min(1, scrolled / totalDist));
        }
      } else {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) {
          progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
        }
      }

      targetFrameRef.current = 1 + progress * (totalFrames - 1);
    };

    const handleResize = () => {
      handleScroll();
      needsRedrawRef.current = true;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    handleScroll();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lerpFactor = prefersReducedMotion ? 1.0 : 0.3;

    const renderLoop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      const absDiff = Math.abs(diff);

      if (absDiff > 8) {
        // Fast flick scroll: jump displayed index directly to target instead of easing
        currentFrameRef.current = targetFrameRef.current;
      } else if (absDiff > 0.001) {
        // Small delta: tighten tracking with lerp 0.3
        currentFrameRef.current += diff * lerpFactor;
      } else {
        currentFrameRef.current = targetFrameRef.current;
      }

      const frameToDraw = Math.max(1, Math.min(totalFrames, Math.round(currentFrameRef.current)));

      if (frameToDraw !== lastDrawnFrameRef.current || needsRedrawRef.current) {
        drawFrame(frameToDraw);
        lastDrawnFrameRef.current = frameToDraw;
        needsRedrawRef.current = false;
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    rafIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [totalFrames, isRevealed]);

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0"
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* Full-Screen HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

// =========================================================================
// 2. MAIN ARCHITECT HERO COMPONENT (Full-Screen illoca.com Architecture)
// =========================================================================
export interface ArchitectHeroProps {
  brandName?: string;
}

export function ArchitectHero({
  brandName = "Astraea",
}: ArchitectHeroProps) {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);

  // Asset-gated loading screen state
  const [criticalCount, setCriticalCount] = useState(0);
  const [criticalComplete, setCriticalComplete] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoaderDone, setIsLoaderDone] = useState(false);

  const exploreBtnRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const coordXRef = useRef<HTMLSpanElement | null>(null);
  const coordYRef = useRef<HTMLSpanElement | null>(null);

  // 1. Detect font readiness
  useEffect(() => {
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready
        .then(() => setFontsReady(true))
        .catch(() => setFontsReady(true));
    } else {
      setFontsReady(true);
    }
  }, []);

  // 2. Safety timeout of 12s: on timeout, reveal anyway so it can never hang on a stalled asset
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWiping(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  // 3. When critical batch (1..25) is decoded and fonts are ready, initiate wipe
  useEffect(() => {
    if (criticalComplete && fontsReady && !isWiping && !isRevealed) {
      setIsWiping(true);
    }
  }, [criticalComplete, fontsReady, isWiping, isRevealed]);

  // 4. While loader is up: lock page scroll (overflow: hidden)
  useEffect(() => {
    if (!isRevealed) {
      const origHtmlOverflow = document.documentElement.style.overflow;
      const origBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = origHtmlOverflow;
        document.body.style.overflow = origBodyOverflow;
      };
    }
  }, [isRevealed]);

  const handleWipeComplete = () => {
    setIsRevealed(true);
    setIsLoaderDone(true);
  };

  useEffect(() => {
    const isTouchDevice = () =>
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches;

    const handleMouseMove = (e: MouseEvent) => {
      if (!tooltipRef.current || isTouchDevice()) return;

      const target = e.target as HTMLElement | null;
      const gridEl = target?.closest(".bg-drafting-grid") as HTMLElement | null;

      if (!gridEl) {
        tooltipRef.current.style.opacity = "0";
        return;
      }

      const rect = gridEl.getBoundingClientRect();
      const relX = Math.max(0, e.clientX - rect.left);
      const relY = Math.max(0, e.clientY - rect.top);
      // Convert CSS px to engineering mm at standard 96 DPI (1px = 0.2645833 mm)
      const MM_PER_PX = 0.2645833;
      const gridX = (relX * MM_PER_PX).toFixed(2);
      const gridY = (relY * MM_PER_PX).toFixed(2);

      if (coordXRef.current) coordXRef.current.textContent = gridX;
      if (coordYRef.current) coordYRef.current.textContent = gridY;

      // Keep tooltip visible and prevent overflow near viewport edges
      const offsetX = e.clientX + 14 > window.innerWidth - 80 ? e.clientX - 72 : e.clientX + 14;
      const offsetY = e.clientY + 14 > window.innerHeight - 50 ? e.clientY - 42 : e.clientY + 14;

      tooltipRef.current.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      tooltipRef.current.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = "0";
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      const track = document.getElementById("scroll-story-track");
      if (track) {
        const rect = track.getBoundingClientRect();
        setIsPastHero(rect.bottom <= window.innerHeight * 0.2);
      }
    };
    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#f4ebd7] text-[#292929] selection:bg-[#124ead]/20 selection:text-[#124ead] overflow-x-hidden">
      
      {/* Dynamic Cursor Tip Technical Drafting Coordinates (Active over paper grid) */}
      <div
        ref={tooltipRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-50 opacity-0 transition-opacity duration-100 ease-out select-none will-change-transform"
        style={{ transform: "translate3d(-9999px, -9999px, 0)" }}
      >
        <div className="bg-[#f4ebd7]/95 backdrop-blur-[2px] border border-[#292929]/25 px-1.5 py-0.5 rounded-[2px] shadow-xs text-[10px] sm:text-[11px] font-mono text-[#5c6470] tracking-tight leading-[1.25]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#3a3f47]">X</span>
            <span ref={coordXRef}>127.65</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#3a3f47]">Y</span>
            <span ref={coordYRef}>264.80</span>
          </div>
        </div>
      </div>

      {/* 0. FULL-PAGE BLUEPRINT ASSET-GATED LOADER */}
      {!isLoaderDone && (
        <BlueprintLoader
          progress={Math.round((criticalCount / 53) * 100)}
          loadedCount={criticalCount}
          totalCritical={53}
          fontsReady={fontsReady}
          isWiping={isWiping}
          onWipeComplete={handleWipeComplete}
        />
      )}

      {/* 1. FIXED FULL-SCREEN HTML5 CANVAS (100vw x 100vh) */}
      <FullScreenCanvas
        totalFrames={300}
        isRevealed={isRevealed}
        onCriticalProgress={(loaded) => setCriticalCount(loaded)}
        onCriticalComplete={() => setCriticalComplete(true)}
      />

      {/* 2. FIXED TOP MARGINALIA & FLOATING NAVBAR (Z-40) */}
      <header className="fixed top-0 left-0 w-full z-40 pointer-events-none px-4 sm:px-8 md:px-12 pt-3">
        <div className="w-full flex items-start justify-between relative">
          
          {/* Top-Left Spacer (balances layout across header) */}
          <div className="w-20 sm:w-28 hidden sm:block pointer-events-none select-none" />

          {/* Center: Floating Technical Dock Navbar */}
          <nav className={`absolute left-1/2 -translate-x-1/2 top-0 flex items-center bg-[#fbf9f4] border border-[#292929]/30 rounded-[3px] py-1 px-2.5 sm:px-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] pointer-events-auto max-w-[94vw] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 ${
            isRevealed ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}>
            {/* Blueprint Geometric Logo + Brand Name */}
            <div className="flex items-center gap-2 pr-3 sm:pr-4 border-r border-[#292929]/20 select-none">
              <AstraeaLogo variant="mark" size="sm" />
              <span className="text-xs sm:text-sm font-bold tracking-tight text-[#292929] select-none">
                {brandName}
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-5 sm:gap-6 px-3 sm:px-4 text-[12px] font-medium text-[#292929]">
              <a href="#platform" className="hover:text-[#124ead] transition-colors flex items-center gap-1 select-none">
                <span>Platform</span>
                <svg className="w-2.5 h-2.5 text-[#292929]/70" viewBox="0 0 10 6" fill="currentColor">
                  <path d="M0 0L5 5L10 0H0Z" />
                </svg>
              </a>
              <a href="#how-it-works" className="hover:text-[#124ead] transition-colors select-none">
                How It Works
              </a>
              <a href="#solutions" className="hover:text-[#124ead] transition-colors select-none">
                Solutions
              </a>
            </div>

            {/* Right CTA Button */}
            <div className="pl-1 sm:pl-2">
              <button
                ref={exploreBtnRef}
                type="button"
                onClick={() => setIsModeModalOpen(true)}
                className="group inline-flex items-center gap-2 bg-[#124ead] hover:bg-[#0d3b85] text-white text-[11px] sm:text-[12px] font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[3px] transition-all shadow-sm active:scale-95 select-none cursor-pointer"
              >
                <AstraeaLogo variant="mark" size="xs" theme="orange" />
                <span className="whitespace-nowrap tracking-normal">Explore Platform</span>
              </button>
            </div>
          </nav>

          {/* Top-Right: Contact Label (fades when past hero) */}
          <div
            className={`text-[11px] sm:text-xs font-handwriting text-[#4a5260] tracking-wider select-none uppercase pt-1 text-right pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300 ${
              isPastHero ? "opacity-0 pointer-events-none" : isRevealed ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
          >
            BUILT FOR THE FACTORY FLOOR
          </div>
        </div>
      </header>

      {/* 3. FIXED BOTTOM-RIGHT MICROCOPY (Z-40) */}
      <div
        className={`fixed bottom-3 sm:bottom-4 right-3 sm:right-6 z-40 flex items-center gap-1.5 sm:gap-2 bg-[#024ab4]/85 px-2.5 py-1 rounded-[2px] backdrop-blur-[2px] pointer-events-none select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-500 ${
          isPastHero ? "opacity-0 pointer-events-none" : isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <span className="text-[10px] sm:text-[11px] md:text-[12px] font-sans text-white/95 tracking-normal font-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          From engineering drawings to actionable factory intelligence.
        </span>
        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#ff5500] rounded-[2px] flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg className="w-2 h-2 text-white stroke-[2.5]" viewBox="0 0 10 10" fill="none" stroke="currentColor">
            <path d="M2 5h6M5 2l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* 4. SCROLL STORY TRACK (450vh) */}
      <div id="scroll-story-track" className="relative w-full min-h-[450vh] z-10 pointer-events-none">
        
        {/* Initial Hero Headline Section:
            Sits at the top of the page on warm parchment grid.
            As user scrolls down, this block scrolls UP and reveals
            the fixed canvas full-screen underneath! */}
        <section
          id="hero-headline-banner"
          className="relative w-full min-h-[47.5vh] bg-[#f4ebd7] bg-drafting-grid border-b border-[#292929] pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-10 px-4 sm:px-8 md:px-12 flex flex-col items-center justify-center pointer-events-auto"
        >
          <div className="relative w-full max-w-5xl text-center">

            {/* Left Sketched Annotation: "INDUSTRIAL INTELLIGENCE" */}
            <div className={`absolute -top-6 sm:-top-8 left-2 sm:left-4 md:-left-12 lg:-left-20 transform -rotate-[5deg] select-none pointer-events-none z-20 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-500 ${
              isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}>
              <div className="relative inline-block px-2 sm:px-2.5 py-0.5">
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 140 32"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3,4 Q70,2 136,3 Q138,15 137,28 Q70,30 2,29 Q3,16 3,4"
                    fill="none"
                    stroke="#5c6470"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                  />
                  <line x1="6" y1="29" x2="134" y2="28" stroke="#5c6470" strokeWidth="0.8" opacity="0.6" />
                </svg>
                <span className="font-handwriting text-[11px] sm:text-[13px] md:text-[14px] text-[#424a56] uppercase tracking-wider font-bold">
                  INDUSTRIAL INTELLIGENCE
                </span>
              </div>
            </div>

            {/* Right Sketched Annotation: "POWERED BY AI" */}
            <div className={`absolute top-1/2 translate-y-1 sm:translate-y-2 right-1 sm:right-2 md:-right-10 lg:-right-20 transform rotate-[2deg] select-none pointer-events-none z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-700 ${
              isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}>
              <svg className="w-8 sm:w-12 h-4 text-[#5c6470] flex-shrink-0" viewBox="0 0 48 16" fill="none" stroke="currentColor">
                <path d="M45,8 C35,7 20,8 6,8" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M14,3 L5,8 L14,13" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex flex-col text-left leading-none">
                <span className="font-handwriting text-[10px] sm:text-[12px] md:text-[13px] text-[#424a56] font-bold tracking-wider uppercase border-b border-[#5c6470]/60 pb-0.5">
                  POWERED BY AI
                </span>
              </div>
            </div>

            {/* The Massive Two-Line Headline */}
            <h1 className="text-[2.6rem] sm:text-6xl md:text-7xl lg:text-[5.4rem] xl:text-[6.2rem] font-bold tracking-[-0.035em] text-[#292929] leading-[0.98] sm:leading-[0.96] select-text">
              <span className={`block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150 ${
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}>
                Industrial knowledge,
              </span>
              <span className={`block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-350 ${
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}>
                made intelligent.
              </span>
            </h1>
          </div>
        </section>

        {/* The Transparent Scroll Track:
            Allows the full-screen canvas underneath to cover 100% of the viewport!
            As the user scrolls through this area, the canvas scrubs through all 183 frames! */}
        <div className="w-full h-[400vh] pointer-events-none" />

      </div>

      {/* Feature Selection Modal */}
      <PlatformModeModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        buttonRef={exploreBtnRef}
      />
    </div>
  );
}

export default ArchitectHero;
