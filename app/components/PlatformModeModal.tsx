"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AstraeaLogo } from "./AstraeaLogo";

export interface PlatformModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function PlatformModeModal({
  isOpen,
  onClose,
  buttonRef,
}: PlatformModeOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Focus management and escape key listener
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button on modal open for immediate keyboard accessibility
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        buttonRef?.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-[#101418]/65 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 motion-reduce:animate-none select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="platform-mode-title"
    >
      {/* Centered Modal Card Container */}
      <div
        className="relative w-full max-w-4xl my-auto bg-[#F6EFDB] rounded-xl sm:rounded-2xl border-2 border-[#101418] shadow-[8px_8px_0_#101418] sm:shadow-[10px_10px_0_#101418] p-4 sm:p-6 md:p-8 overflow-hidden animate-in zoom-in-95 duration-200 motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#101418]/15">
          {/* Eyebrow Status Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FFFBF0] border border-[#101418]/25 px-2.5 py-1 rounded-[3px] text-[11px] font-mono tracking-wider text-[#101418] shadow-[1px_1px_0_#101418]/20">
            <AstraeaLogo variant="mark" size="xs" />
            <span className="font-bold">ASTRAEA</span>
            <span className="text-[#101418]/30">//</span>
            <span className="text-[#5c6470] font-semibold">WORKSPACE SELECTOR</span>
          </div>

          {/* Close Button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close mode selector"
            title="Close (Esc)"
            className="w-8 h-8 rounded-full bg-[#FFFBF0] border-2 border-[#101418] text-[#101418] hover:bg-[#ff5500] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5500] focus-visible:ring-offset-2 transition-colors flex items-center justify-center font-bold text-sm shadow-[2px_2px_0_#101418] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <div className="pt-3 pb-3 sm:pb-5">
          <h2
            id="platform-mode-title"
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#101418]"
          >
            Choose Workspace Mode
          </h2>
        </div>

        {/* 2-Column Mode Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Card 1: Engineering Mode */}
          <Link
            href="/architect"
            onClick={onClose}
            title="Engineering Mode vs Frontline Mode"
            className="group flex flex-col bg-[#FFFBF0] rounded-xl border-2 border-[#101418] shadow-[5px_5px_0_#101418] hover:shadow-[7px_7px_0_#101418] hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:shadow-[7px_7px_0_#101418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124ead] focus-visible:ring-offset-2 transition-all duration-200 overflow-hidden cursor-pointer"
          >
            {/* Visual Frame */}
            <div className="relative w-full h-44 sm:h-48 md:h-52 bg-[#0c2340] border-b-2 border-[#101418] overflow-hidden">
              <div className="absolute top-2.5 left-2.5 z-10 bg-[#124ead] text-white text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-[2px] tracking-wider uppercase shadow-[2px_2px_0_#101418]">
                MODE 01 // ENGINEERING
              </div>
              <Image
                src="/images/ezgif-frame-051.png"
                alt="Engineering Mode interface preview"
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover group-hover:scale-105 transition-transform duration-300 motion-reduce:transform-none"
                priority
              />
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-block font-mono text-[11px] font-bold tracking-wider text-[#124ead] uppercase">
                  CAD AUTOMATION &amp; METROLOGY
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#101418] tracking-tight group-hover:text-[#124ead] transition-colors">
                  Engineering Mode
                </h3>

                {/* Capability Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] sm:text-[11px] font-mono font-medium px-2 py-0.5 bg-[#E8EEFC] text-[#124ead] border border-[#124ead]/20 rounded">
                    ASME Y14.5
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono font-medium px-2 py-0.5 bg-[#E8EEFC] text-[#124ead] border border-[#124ead]/20 rounded">
                    GD&amp;T Extraction
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono font-medium px-2 py-0.5 bg-[#E8EEFC] text-[#124ead] border border-[#124ead]/20 rounded">
                    Revision Diffs
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-2 bg-[#ff5500] group-hover:bg-[#e04a00] text-white py-2.5 sm:py-3 px-4 rounded-lg border-2 border-[#101418] shadow-[3px_3px_0_#101418] group-hover:shadow-[4px_4px_0_#101418] transition-all flex items-center justify-between font-bold text-sm tracking-wide">
                <span>Launch Engineering Mode</span>
                <span className="text-white text-base group-hover:translate-x-1 transition-transform motion-reduce:transform-none">
                  →
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Frontline Mode */}
          <Link
            href="/frontline"
            onClick={onClose}
            title="Engineering Mode vs Frontline Mode"
            className="group flex flex-col bg-[#FFFBF0] rounded-xl border-2 border-[#101418] shadow-[5px_5px_0_#101418] hover:shadow-[7px_7px_0_#101418] hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:shadow-[7px_7px_0_#101418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5500] focus-visible:ring-offset-2 transition-all duration-200 overflow-hidden cursor-pointer"
          >
            {/* Visual Frame */}
            <div className="relative w-full h-44 sm:h-48 md:h-52 bg-[#0c2340] border-b-2 border-[#101418] overflow-hidden">
              <div className="absolute top-2.5 left-2.5 z-10 bg-[#ff5500] text-white text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-[2px] tracking-wider uppercase shadow-[2px_2px_0_#101418]">
                MODE 02 // FRONTLINE
              </div>
              <Image
                src="/images/ezgif-frame-218.png"
                alt="Frontline Mode interface preview"
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover group-hover:scale-105 transition-transform duration-300 motion-reduce:transform-none"
                priority
              />
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-block font-mono text-[11px] font-bold tracking-wider text-[#ff5500] uppercase">
                  SHOP FLOOR OPERATIONS &amp; COPILOT
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#101418] tracking-tight group-hover:text-[#ff5500] transition-colors">
                  Frontline Mode
                </h3>

                {/* Capability Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] sm:text-[11px] font-mono font-medium px-2 py-0.5 bg-[#FFF3C4] text-[#8a3800] border border-[#ff5500]/25 rounded">
                    Telemetry Stream
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono font-medium px-2 py-0.5 bg-[#FFF3C4] text-[#8a3800] border border-[#ff5500]/25 rounded">
                    Shift Logs &amp; WOs
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono font-medium px-2 py-0.5 bg-[#FFF3C4] text-[#8a3800] border border-[#ff5500]/25 rounded">
                    Shop-Floor AI
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-2 bg-[#ff5500] group-hover:bg-[#e04a00] text-white py-2.5 sm:py-3 px-4 rounded-lg border-2 border-[#101418] shadow-[3px_3px_0_#101418] group-hover:shadow-[4px_4px_0_#101418] transition-all flex items-center justify-between font-bold text-sm tracking-wide">
                <span>Launch Frontline Mode</span>
                <span className="text-white text-base group-hover:translate-x-1 transition-transform motion-reduce:transform-none">
                  →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Modal Window Footer */}
        <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-[#101418]/15 text-[11px] font-mono text-[#5c6470]">
          <div className="flex items-center gap-1.5">
            <span>DISMISS:</span>
            <kbd className="px-1.5 py-0.5 bg-[#FFFBF0] border border-[#101418]/30 rounded text-[#101418] font-bold text-[10px] shadow-[1px_1px_0_#101418]/20">
              ESC
            </kbd>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            <span className="font-semibold text-[#101418]">SYSTEM READY</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlatformModeModal;
