"use client";

import React from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { SystemMonitor } from "../../components/SystemMonitor";
import { AstraeaLogo } from "../../components/AstraeaLogo";

interface AppShellProps {
  children: React.ReactNode;
  onNewDrawing: () => void;
  selectedRunId: string;
  onSelectRun: (runId: string) => void;
  titleLabel?: string;
}

export function AppShell({
  children,
  onNewDrawing,
  selectedRunId,
  onSelectRun,
  titleLabel = "New drawing",
}: AppShellProps) {
  return (
    <div className="h-screen w-screen bg-[#FFFBF0] flex flex-col overflow-hidden text-[#101418] font-sans antialiased relative selection:bg-[#E8EEFC] selection:text-[#1E43D8]">
      {/* Top Bar - Full Width Edge to Edge */}
      <header className="h-12 border-b-2 border-[#101418] px-4 sm:px-6 flex items-center justify-between bg-[#FFFBF0] shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Astraea Wordmark & Logo Mark */}
          <Link
            href="/"
            className="flex items-center gap-2 text-[#101418] hover:opacity-90 transition-opacity group cursor-pointer"
            title="Return to Astraea Landing Page"
          >
            <AstraeaLogo size="sm" />
          </Link>

          <span className="text-[#101418]/30 select-none font-mono">/</span>

          {/* Label in Plex Mono uppercase */}
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#101418]/70 truncate max-w-[200px] sm:max-w-none">
            {titleLabel}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Sparse decor: Tiny mono coordinate readout */}
          <span className="hidden sm:inline-block font-mono text-[11px] tracking-widest text-[#101418]/60 select-none">
            X 127.05 · Y 264.89
          </span>

          <SystemMonitor />

          {/* Right side: Hand-drawn Caveat annotation link */}
          <Link
            href="/"
            className="font-hand text-base font-bold text-[#101418] hover:text-[#1E43D8] transition-colors underline decoration-[#101418]/30 hover:decoration-[#1E43D8] flex items-center gap-1"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Content Area: Sidebar + Main Stage - Full Screen Fill */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          onNewDrawing={onNewDrawing}
          selectedRunId={selectedRunId}
          onSelectRun={onSelectRun}
        />

        {/* Main workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#FFFBF0] relative">
          {children}
        </main>
      </div>

      {/* Corner decor: "N" north-arrow badge at bottom-left */}
      <div
        className="absolute bottom-2.5 left-2.5 z-30 w-6 h-6 rounded-full bg-[#FFFBF0] border-[1.5px] border-[#101418] shadow-2xs flex items-center justify-center pointer-events-none select-none"
        title="Grid North"
      >
        <div className="flex items-center justify-center relative">
          <span className="font-mono font-bold text-[9px] text-[#101418] leading-none">N</span>
          <div className="absolute -top-1 w-0 h-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-b-[3px] border-b-[#101418]" />
        </div>
      </div>
    </div>
  );
}
