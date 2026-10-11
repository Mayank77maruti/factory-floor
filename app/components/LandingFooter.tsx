"use client";

import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="relative w-full bg-[#F6EFDB] bg-drafting-grid text-[#101418] border-t-2 border-[#101418] z-30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
        
        {/* Top Brand & Status Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-[#101418]/15">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-[#ff5500] rounded-[2px]" />
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#101418] font-mono">
                MANUFY
              </span>
              <span className="text-[#101418]/30 font-mono text-sm">//</span>
              <span className="text-xs font-mono text-[#5c6470] tracking-wider font-semibold">
                INDUSTRIAL INTELLIGENCE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#424a56] max-w-lg font-sans">
              From engineering CAD drawings to autonomous ASME Y14.5 verification and real-time shop-floor execution.
            </p>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-2 bg-[#FFFBF0] border border-[#101418]/25 px-3 py-1.5 rounded-[4px] font-mono text-xs text-[#101418] shadow-[1px_1px_0_#101418]/15">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
            </span>
            <span className="font-bold text-[#101418]">PROD :: asia-south1</span>
            <span className="text-[#101418]/30">|</span>
            <span className="text-[#5c6470] font-semibold">SYSTEM NOMINAL</span>
          </div>
        </div>

        {/* 4-Column Navigation Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-[#101418]/15 text-xs font-mono">
          
          {/* Col 1: Operational Modes */}
          <div className="space-y-3">
            <div className="font-bold text-[#ff5500] uppercase tracking-wider text-[11px]">
              OPERATIONAL MODES
            </div>
            <ul className="space-y-2 text-[#424a56]">
              <li>
                <Link href="/architect" className="hover:text-[#124ead] hover:underline transition-colors flex items-center gap-1.5 font-medium">
                  <span className="text-[#124ead]">↳</span> Architect Mode
                </Link>
              </li>
              <li>
                <Link href="/frontline" className="hover:text-[#ff5500] hover:underline transition-colors flex items-center gap-1.5 font-medium">
                  <span className="text-[#ff5500]">↳</span> Frontline Mode
                </Link>
              </li>
              <li>
                <a href="#architect-mode-experience" className="hover:text-[#101418] transition-colors">
                  3D to 2D Autodrafting
                </a>
              </li>
              <li>
                <a href="#explore-frontline-mode" className="hover:text-[#101418] transition-colors">
                  Connected Frontline
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Platform Capabilities */}
          <div className="space-y-3">
            <div className="font-bold text-[#101418] uppercase tracking-wider text-[11px]">
              CAPABILITIES
            </div>
            <ul className="space-y-2 text-[#424a56]">
              <li>
                <a href="#section-parsed-drawings" className="hover:text-[#124ead] transition-colors">
                  Parsed Drawings
                </a>
              </li>
              <li>
                <a href="#section-standards-checking" className="hover:text-[#124ead] transition-colors">
                  Standards Checking
                </a>
              </li>
              <li>
                <a href="#section-revision-intelligence" className="hover:text-[#124ead] transition-colors">
                  Revision Intelligence
                </a>
              </li>
              <li>
                <a href="#section-agentic-answers" className="hover:text-[#124ead] transition-colors">
                  Agentic Answers
                </a>
              </li>
              <li>
                <a href="#section-shop-floor-handoff" className="hover:text-[#124ead] transition-colors">
                  Shop-Floor Handoff
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Standards & Verification */}
          <div className="space-y-3">
            <div className="font-bold text-[#101418] uppercase tracking-wider text-[11px]">
              GOVERNING STANDARDS
            </div>
            <ul className="space-y-2 text-[#424a56]">
              <li>
                <span className="font-semibold text-[#101418]">ASME Y14.5-2018</span>
              </li>
              <li>
                <span>ISO 1101 Geometrical</span>
              </li>
              <li>
                <span>ASME Y14.3 Multi-View</span>
              </li>
              <li>
                <span>Cpk 1.82 Six Sigma</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Diagnostics */}
          <div className="space-y-3">
            <div className="font-bold text-[#101418] uppercase tracking-wider text-[11px]">
              DIAGNOSTICS &amp; API
            </div>
            <ul className="space-y-2 text-[#424a56]">
              <li>
                <Link href="/api/health" className="hover:text-[#124ead] transition-colors font-medium">
                  Cluster Health (/api/health)
                </Link>
              </li>
              <li>
                <span className="text-[#5c6470]">Vertex AI Gemini 3.8 Flash</span>
              </li>
              <li>
                <span className="text-[#5c6470]">Cloud Storage Bucket</span>
              </li>
              <li>
                <span className="text-[#5c6470]">Firestore Persistence</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#5c6470]">
          <div>
            © 2026 Manufy Systems, Inc. All rights reserved. Built for precision factory floors.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#101418] cursor-pointer">PRIVACY</span>
            <span>·</span>
            <span className="hover:text-[#101418] cursor-pointer">SECURITY</span>
            <span>·</span>
            <span className="hover:text-[#101418] cursor-pointer">ASME Y14.5 COMPLIANT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
