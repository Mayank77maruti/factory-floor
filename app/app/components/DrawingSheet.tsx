"use client";

import React, { useState } from "react";
import { getDrawingVariant, DrawingVariant } from "../drawingVariants";

interface DrawingSheetProps {
  fileName?: string;
}

export function DrawingSheet({ fileName = "clevis.step" }: DrawingSheetProps) {
  const [downloadNotice, setDownloadNotice] = useState(false);
  const variant: DrawingVariant = getDrawingVariant(fileName);

  const handleDownload = () => {
    const svgElement = document.getElementById("astraea-drawing-svg");
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = variant.downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Card: Sheet Header & Actions */}
      <div className="w-full bg-white rounded-xl border-2 border-[#101418] p-5 sm:p-6 shadow-hard-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-[1.5px] border-[#101418]/20">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold uppercase tracking-wider text-[#101418]">
                Drawing Sheet · {variant.titleBlock.title}
              </h2>
              <span className="font-mono inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#E8EEFC] text-[#1E43D8] border-[1.5px] border-[#101418] shadow-2xs">
                ASME Y14.100 Complete
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#101418]/60 mt-0.5">
              Automated production drawing generated in {variant.stats.timeGenerated} · 3 principal views + axonometric iso · {variant.stats.dimensionsPlaced} dimensions placed
            </p>
          </div>

          <div className="flex items-center gap-3">
            {downloadNotice && (
              <span className="font-mono text-xs text-[#1E43D8] font-bold animate-fade-in">
                Downloaded {variant.downloadFileName}
              </span>
            )}
            <button
              onClick={handleDownload}
              className="btn-royal text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 cursor-pointer font-semibold"
            >
              <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download smart.svg</span>
            </button>
          </div>
        </div>

        {/* SVG Drawing Canvas: White Background */}
        <div className="mt-5 p-3 sm:p-5 bg-stone-100/70 border-2 border-[#101418] rounded-lg overflow-x-auto flex justify-center shadow-inner">
          <div className="w-full min-w-[700px] max-w-6xl bg-white rounded border-2 border-[#101418] shadow-hard-xs select-none">
            <svg
              id="astraea-drawing-svg"
              viewBox="0 0 1200 840"
              className="w-full h-auto text-[#101418] font-sans"
              style={{ backgroundColor: "#ffffff" }}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#101418" />
                </marker>
                <marker
                  id="arrow-rev"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto"
                >
                  <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="#101418" />
                </marker>
                <pattern id="astraea-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(31,58,138,0.08)" strokeWidth="0.8" />
                </pattern>
              </defs>

              <rect width="1200" height="840" fill="url(#astraea-grid)" />

              {/* Outer Border (ASME Zone Margin) */}
              <rect x="20" y="20" width="1160" height="800" fill="none" stroke="#101418" strokeWidth="2.5" />
              {/* Inner Margin */}
              <rect x="40" y="40" width="1120" height="760" fill="none" stroke="#101418" strokeWidth="1.5" />

              {/* Zone Markers - Top & Bottom: 1 to 6 */}
              {[
                { zone: "6", x: 133 },
                { zone: "5", x: 320 },
                { zone: "4", x: 507 },
                { zone: "3", x: 693 },
                { zone: "2", x: 880 },
                { zone: "1", x: 1067 },
              ].map(({ zone, x }) => (
                <g key={`top-${zone}`}>
                  <line x1={x} y1="20" x2={x} y2="40" stroke="#101418" strokeWidth="1.2" />
                  <text x={x} y="33" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418">{zone}</text>
                  <line x1={x} y1="800" x2={x} y2="820" stroke="#101418" strokeWidth="1.2" />
                  <text x={x} y="813" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418">{zone}</text>
                </g>
              ))}

              {/* Zone Markers - Left & Right: A to D */}
              {[
                { zone: "A", y: 135 },
                { zone: "B", y: 325 },
                { zone: "C", y: 515 },
                { zone: "D", y: 705 },
              ].map(({ zone, y }) => (
                <g key={`side-${zone}`}>
                  <line x1="20" y1={y} x2="40" y2={y} stroke="#101418" strokeWidth="1.2" />
                  <text x="31" y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418">{zone}</text>
                  <line x1="1160" y1={y} x2="1180" y2={y} stroke="#101418" strokeWidth="1.2" />
                  <text x={1171} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418">{zone}</text>
                </g>
              ))}

              {/* GENERAL NOTES BLOCK */}
              <g transform="translate(60, 60)">
                <rect width="320" height="120" fill="#FFFBF0" stroke="#101418" strokeWidth="1.5" />
                <text x="12" y="20" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418">GENERAL NOTES (UNLESS SPECIFIED):</text>
                {variant.notes.map((note, idx) => (
                  <text key={idx} x="12" y={38 + idx * 16} fontSize="9.5" fill="#101418" fontFamily="monospace">
                    {note}
                  </text>
                ))}
              </g>

              {/* VARIANT VIEWS GEOMETRY */}
              {variant.variantKey === "A" && <VariantAViews />}
              {variant.variantKey === "B" && <VariantBViews />}
              {variant.variantKey === "C" && <VariantCViews />}

              {/* TITLE BLOCK: ASTRAEA */}
              <g transform="translate(680, 680)">
                <rect width="480" height="120" fill="#FFFBF0" stroke="#101418" strokeWidth="2" />
                <line x1="0" y1="36" x2="480" y2="36" stroke="#101418" strokeWidth="1.5" />
                <line x1="0" y1="78" x2="480" y2="78" stroke="#101418" strokeWidth="1.5" />
                <line x1="160" y1="0" x2="160" y2="78" stroke="#101418" strokeWidth="1.5" />
                <line x1="330" y1="0" x2="330" y2="120" stroke="#101418" strokeWidth="1.5" />
                <line x1="410" y1="78" x2="410" y2="120" stroke="#101418" strokeWidth="1.5" />

                {/* Organization */}
                <text x="12" y="16" fontSize="8" fontWeight="700" fontFamily="monospace" fill="#101418">ORGANIZATION</text>
                <text x="12" y="30" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418">ASTRAEA AUTODRAFT SYSTEM</text>

                {/* Title */}
                <text x="172" y="16" fontSize="8" fontWeight="700" fontFamily="monospace" fill="#101418">TITLE</text>
                <text x="172" y="31" fontSize="13" fontWeight="800" fontFamily="sans-serif" fill="#101418">
                  {variant.titleBlock.title}
                </text>

                {/* Drawing No */}
                <text x="12" y="52" fontSize="8" fontWeight="700" fontFamily="monospace" fill="#101418">DRAWING NO.</text>
                <text x="12" y="70" fontSize="13" fontWeight="700" fontFamily="monospace" fill="#101418">
                  {variant.titleBlock.dwgNo}
                </text>

                {/* Revision */}
                <text x="172" y="52" fontSize="8" fontWeight="700" fontFamily="monospace" fill="#101418">REVISION</text>
                <text x="172" y="70" fontSize="12" fontWeight="700" fontFamily="monospace" fill="#101418">
                  {variant.titleBlock.revStatus}
                </text>

                {/* Projection Symbol */}
                <g transform="translate(350, 8)">
                  <text x="0" y="8" fontSize="7" fontWeight="700" fontFamily="monospace" fill="#101418">PROJECTION</text>
                  <circle cx="20" cy="20" r="8" fill="none" stroke="#101418" strokeWidth="1" />
                  <circle cx="20" cy="20" r="4" fill="none" stroke="#101418" strokeWidth="0.8" />
                  <polygon points="36,12 56,16 56,24 36,28" fill="none" stroke="#101418" strokeWidth="1" />
                </g>

                <text x="12" y="94" fontSize="8" fontWeight="700" fontFamily="monospace" fill="#101418">DRAWN BY</text>
                <text x="12" y="110" fontSize="10.5" fontWeight="700" fontFamily="monospace" fill="#101418">
                  {variant.titleBlock.drawnBy}
                </text>

                <text x="172" y="94" fontSize="8" fontWeight="700" fontFamily="monospace" fill="#101418">DATE</text>
                <text x="172" y="110" fontSize="10" fontWeight="700" fontFamily="monospace" fill="#101418">
                  {variant.titleBlock.date}
                </text>

                <text x="342" y="94" fontSize="8" fontWeight="700" fontFamily="monospace" fill="#101418">SCALE</text>
                <text x="342" y="110" fontSize="10" fontWeight="700" fontFamily="monospace" fill="#101418">
                  {variant.titleBlock.scale}
                </text>

                <text x="422" y="94" fontSize="8" fontWeight="700" fontFamily="monospace" fill="#101418">SHEET</text>
                <text x="422" y="110" fontSize="10" fontWeight="700" fontFamily="monospace" fill="#101418">
                  {variant.titleBlock.sheet}
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Card: Layout Report Table */}
      <div className="w-full bg-white rounded-xl border-2 border-[#101418] p-5 sm:p-6 shadow-hard-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-[1.5px] border-[#101418]/20">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#101418]">
                LAYOUT REPORT · {variant.issues.length} ISSUES
              </h3>
            </div>
            <p className="font-mono text-[11px] text-[#101418]/60 mt-0.5">
              Automated spatial constraint solver resolving dimension collisions, leader cross-overs, and border margins
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 bg-[#FFC53D] text-[#101418] px-2 py-0.5 rounded border border-[#101418] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#101418]"></span>
              {variant.stats.warningsCount} warnings adjusted
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#E8EEFC] text-[#1E43D8] px-2 py-0.5 rounded border border-[#101418] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E43D8]"></span>
              {variant.stats.optimalCount} optimal checks
            </span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border-[1.5px] border-[#101418] shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E8EEFC] border-b-[1.5px] border-[#101418] text-[#101418] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 font-bold w-12 text-center">#</th>
                <th className="py-2.5 px-3 font-bold w-28">Severity</th>
                <th className="py-2.5 px-3 font-bold">Issue description</th>
                <th className="py-2.5 px-3 font-bold">Detail</th>
                <th className="py-2.5 px-3 font-bold w-48 text-right">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101418]/15 bg-white font-sans">
              {variant.issues.map((issue) => {
                const isWarning = issue.severity === "warning" || issue.severity === "MAJOR";
                return (
                  <tr
                    key={issue.id}
                    className={`transition-colors ${
                      isWarning
                        ? "bg-[#FFC53D]/30 border-y-[1.5px] border-[#101418]"
                        : "hover:bg-[#F3ECCE]/60"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[#101418]/60 text-center">
                      {issue.id}
                    </td>
                    <td className="py-2.5 px-3">
                      {isWarning ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#FFC53D] text-[#101418] border-[1.5px] border-[#101418] shadow-2xs">
                          Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#E8EEFC] text-[#1E43D8] border border-[#101418]">
                          Info
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#101418]">
                      {issue.description}
                    </td>
                    <td className="py-2.5 px-3 text-[#101418]/70">
                      {issue.detail}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] font-semibold text-[#101418]">
                      {issue.resolution}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// VARIANT A VIEWS (CLEVIS MOUNT BRACKET - VERBATIM EXISTING GEOMETRY)
// =============================================================================

function VariantAViews() {
  return (
    <>
      {/* VIEW 1: TOP VIEW */}
      <g transform="translate(360, 100)">
        <text x="0" y="30" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418" letterSpacing="1">TOP VIEW</text>
        
        {/* Centerlines */}
        <line x1="-20" y1="120" x2="300" y2="120" stroke="#1E43D8" strokeWidth="0.9" strokeDasharray="12,3,2,3" />
        <line x1="140" y1="20" x2="140" y2="220" stroke="#1E43D8" strokeWidth="0.9" strokeDasharray="12,3,2,3" />

        {/* Base Plate Outline */}
        <rect x="0" y="50" width="280" height="140" rx="10" fill="#FFFBF0" stroke="#101418" strokeWidth="2" />

        {/* Mounting Holes */}
        <circle cx="40" cy="80" r="14" fill="#E8EEFC" stroke="#101418" strokeWidth="1.5" />
        <circle cx="40" cy="160" r="14" fill="#E8EEFC" stroke="#101418" strokeWidth="1.5" />
        <circle cx="240" cy="80" r="14" fill="#E8EEFC" stroke="#101418" strokeWidth="1.5" />
        <circle cx="240" cy="160" r="14" fill="#E8EEFC" stroke="#101418" strokeWidth="1.5" />

        {/* Center Boss & Slot */}
        <rect x="90" y="75" width="100" height="90" rx="4" fill="#FFFBF0" stroke="#101418" strokeWidth="1.8" />
        <rect x="115" y="50" width="50" height="140" fill="none" stroke="#101418" strokeWidth="1.2" strokeDasharray="4,3" />
        <circle cx="140" cy="120" r="22" fill="#E8EEFC" stroke="#101418" strokeWidth="1.5" />

        {/* Dimensions Top View */}
        <line x1="0" y1="40" x2="0" y2="15" stroke="#101418" strokeWidth="0.8" />
        <line x1="280" y1="40" x2="280" y2="15" stroke="#101418" strokeWidth="0.8" />
        <line x1="0" y1="20" x2="280" y2="20" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" markerEnd="url(#arrow)" />
        <rect x="125" y="12" width="30" height="16" fill="#FFFBF0" />
        <text x="140" y="24" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="monospace" fill="#101418">126</text>

        <line x1="290" y1="50" x2="330" y2="50" stroke="#101418" strokeWidth="0.8" />
        <line x1="290" y1="190" x2="330" y2="190" stroke="#101418" strokeWidth="0.8" />
        <line x1="320" y1="50" x2="320" y2="190" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" markerEnd="url(#arrow)" />
        <rect x="306" y="112" width="28" height="16" fill="#FFFBF0" />
        <text x="320" y="124" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="monospace" fill="#101418">88</text>

        <line x1="40" y1="80" x2="15" y2="40" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" />
        <line x1="15" y1="40" x2="-25" y2="40" stroke="#101418" strokeWidth="1.2" />
        <text x="-20" y="35" textAnchor="start" fontSize="9.5" fontWeight="700" fontFamily="monospace" fill="#101418">4X Ø18</text>
      </g>

      {/* VIEW 2: FRONT VIEW */}
      <g transform="translate(360, 390)">
        <text x="0" y="0" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418" letterSpacing="1">FRONT VIEW (PRIMARY)</text>

        <line x1="140" y1="0" x2="140" y2="240" stroke="#1E43D8" strokeWidth="0.9" strokeDasharray="12,3,2,3" />

        <path
          d="M 0 170 L 280 170 L 280 200 L 0 200 Z"
          fill="#E8EEFC"
          stroke="#101418"
          strokeWidth="2"
        />
        <path
          d="M 60 170 L 60 40 Q 60 10 90 10 Q 120 10 120 40 L 120 170 Z"
          fill="#FFFBF0"
          stroke="#101418"
          strokeWidth="2"
        />
        <path
          d="M 160 170 L 160 40 Q 160 10 190 10 Q 220 10 220 40 L 220 170 Z"
          fill="#FFFBF0"
          stroke="#101418"
          strokeWidth="2"
        />
        <circle cx="90" cy="50" r="16" fill="#E8EEFC" stroke="#101418" strokeWidth="1.5" />
        <circle cx="190" cy="50" r="16" fill="#E8EEFC" stroke="#101418" strokeWidth="1.5" />

        {/* Datum Feature Symbol A */}
        <g transform="translate(140, 200)">
          <line x1="0" y1="0" x2="0" y2="18" stroke="#101418" strokeWidth="1.5" />
          <polygon points="0,0 -6,-10 6,-10" fill="#101418" />
          <rect x="-9" y="18" width="18" height="18" fill="#FFFBF0" stroke="#101418" strokeWidth="1.5" />
          <text x="0" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="monospace" fill="#101418">A</text>
        </g>

        <line x1="0" y1="210" x2="0" y2="245" stroke="#101418" strokeWidth="0.8" />
        <line x1="280" y1="210" x2="280" y2="245" stroke="#101418" strokeWidth="0.8" />
        <line x1="0" y1="235" x2="280" y2="235" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" markerEnd="url(#arrow)" />
        <rect x="125" y="227" width="30" height="16" fill="#FFFBF0" />
        <text x="140" y="239" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="monospace" fill="#101418">150</text>

        <line x1="120" y1="120" x2="160" y2="120" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" markerEnd="url(#arrow)" />
        <rect x="132" y="112" width="16" height="16" fill="#FFFBF0" />
        <text x="140" y="124" textAnchor="middle" fontSize="9" fontWeight="700" fontFamily="monospace" fill="#101418">40</text>

        <line x1="90" y1="50" x2="30" y2="20" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" />
        <line x1="30" y1="20" x2="-20" y2="20" stroke="#101418" strokeWidth="1.2" />
        <text x="-15" y="15" textAnchor="start" fontSize="9.5" fontWeight="700" fontFamily="monospace" fill="#101418">2X Ø10 THRU</text>
      </g>

      {/* VIEW 3: RIGHT VIEW */}
      <g transform="translate(760, 390)">
        <text x="0" y="0" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418" letterSpacing="1">RIGHT VIEW</text>

        <line x1="70" y1="0" x2="70" y2="240" stroke="#1E43D8" strokeWidth="0.9" strokeDasharray="12,3,2,3" />

        <path
          d="M 10 200 L 130 200 L 130 170 L 100 170 L 100 60 Q 100 20 70 20 Q 40 20 40 60 L 40 170 L 10 170 Z"
          fill="#FFFBF0"
          stroke="#101418"
          strokeWidth="2"
        />
        <circle cx="70" cy="50" r="16" fill="#E8EEFC" stroke="#101418" strokeWidth="1.5" />
        <line x1="40" y1="120" x2="100" y2="120" stroke="#101418" strokeWidth="1.2" strokeDasharray="4,3" />

        {/* Datum Feature Symbol B */}
        <g transform="translate(130, 185)">
          <line x1="0" y1="0" x2="18" y2="0" stroke="#101418" strokeWidth="1.5" />
          <polygon points="0,0 10,-6 10,6" fill="#101418" />
          <rect x="18" y="-9" width="18" height="18" fill="#FFFBF0" stroke="#101418" strokeWidth="1.5" />
          <text x="27" y="5" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="monospace" fill="#101418">B</text>
        </g>

        <line x1="70" y1="50" x2="120" y2="25" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" />
        <line x1="120" y1="25" x2="160" y2="25" stroke="#101418" strokeWidth="1.2" />
        <text x="125" y="20" textAnchor="start" fontSize="9.5" fontWeight="700" fontFamily="monospace" fill="#101418">Ø12 THRU</text>

        <line x1="100" y1="170" x2="140" y2="150" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" />
        <line x1="140" y1="150" x2="175" y2="150" stroke="#101418" strokeWidth="1.2" />
        <text x="145" y="145" textAnchor="start" fontSize="9.5" fontWeight="700" fontFamily="monospace" fill="#101418">R6 TYP</text>
      </g>

      {/* VIEW 4: ISOMETRIC AXONOMETRIC */}
      <g transform="translate(770, 90)">
        <text x="40" y="20" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418" letterSpacing="1">ISOMETRIC (1:2)</text>
        <g transform="translate(60, 40) scale(0.65)">
          <polygon points="120,30 220,80 220,180 120,130" fill="#DCE7FB" stroke="#101418" strokeWidth="2" />
          <polygon points="20,80 120,30 120,130 20,180" fill="#FFFBF0" stroke="#101418" strokeWidth="2" />
          <polygon points="20,80 120,30 220,80 120,130" fill="#E8EEFC" stroke="#101418" strokeWidth="2" />

          <polygon points="50,110 90,90 90,170 50,190" fill="#FFFBF0" stroke="#101418" strokeWidth="2" />
          <ellipse cx="70" cy="140" rx="14" ry="18" fill="#E8EEFC" stroke="#101418" strokeWidth="1.8" />

          <polygon points="150,110 190,90 190,170 150,190" fill="#FFFBF0" stroke="#101418" strokeWidth="2" />
          <ellipse cx="170" cy="140" rx="14" ry="18" fill="#E8EEFC" stroke="#101418" strokeWidth="1.8" />
        </g>
      </g>
    </>
  );
}

// =============================================================================
// VARIANT B VIEWS (MOUNTING FLANGE: 100x100 PLATE, Ø60 BORE, 4X Ø10 ON Ø80 BC)
// =============================================================================

function VariantBViews() {
  return (
    <>
      {/* VIEW 1: TOP VIEW (100x100 square plate, central Ø60 bore, 4x Ø10 corner holes on Ø80 bolt circle) */}
      <g transform="translate(360, 90)">
        <text x="0" y="24" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418" letterSpacing="1">
          TOP VIEW (PRIMARY · 2:1)
        </text>

        {/* Centerlines */}
        <line x1="-30" y1="150" x2="310" y2="150" stroke="#1E43D8" strokeWidth="0.9" strokeDasharray="12,3,2,3" />
        <line x1="140" y1="-20" x2="140" y2="320" stroke="#1E43D8" strokeWidth="0.9" strokeDasharray="12,3,2,3" />

        {/* 100x100 Square Plate (Rendered 200x200 at 2:1 scale, centered at 140, 150) */}
        <rect x="40" y="50" width="200" height="200" rx="10" fill="#FFFBF0" stroke="#101418" strokeWidth="2.2" />

        {/* Central Ø60 Bore (r = 60 at 2:1 scale) */}
        <circle cx="140" cy="150" r="60" fill="#E8EEFC" stroke="#101418" strokeWidth="2" />

        {/* Bolt Circle Ø80 (radius 80 at 2:1) - Finding #1: Ghosted / Highlighted amber circle */}
        <circle cx="140" cy="150" r="80" fill="none" stroke="#D92D20" strokeWidth="1.4" strokeDasharray="6,3" />

        {/* 4x Ø10 Holes on Bolt Circle (at 45°, 135°, 225°, 315°: offset = 80 * 0.7071 ≈ 56.5px) */}
        <circle cx="196.5" cy="93.5" r="10" fill="#FFFBF0" stroke="#101418" strokeWidth="1.6" />
        <circle cx="83.5" cy="93.5" r="10" fill="#FFFBF0" stroke="#101418" strokeWidth="1.6" />
        <circle cx="83.5" cy="206.5" r="10" fill="#FFFBF0" stroke="#101418" strokeWidth="1.6" />
        <circle cx="196.5" cy="206.5" r="10" fill="#FFFBF0" stroke="#101418" strokeWidth="1.6" />

        {/* Center marks on 4 holes */}
        {[
          { cx: 196.5, cy: 93.5 },
          { cx: 83.5, cy: 93.5 },
          { cx: 83.5, cy: 206.5 },
          { cx: 196.5, cy: 206.5 },
        ].map((pt, i) => (
          <g key={i}>
            <line x1={pt.cx - 14} y1={pt.cy} x2={pt.cx + 14} y2={pt.cy} stroke="#1E43D8" strokeWidth="0.7" />
            <line x1={pt.cx} y1={pt.cy - 14} x2={pt.cx} y2={pt.cy + 14} stroke="#1E43D8" strokeWidth="0.7" />
          </g>
        ))}

        {/* DIMENSION: Width 100 */}
        <line x1="40" y1="40" x2="40" y2="15" stroke="#101418" strokeWidth="0.8" />
        <line x1="240" y1="40" x2="240" y2="15" stroke="#101418" strokeWidth="0.8" />
        <line x1="40" y1="20" x2="240" y2="20" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" markerEnd="url(#arrow)" />
        <rect x="125" y="12" width="30" height="16" fill="#FFFBF0" />
        <text x="140" y="24" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="monospace" fill="#101418">100</text>

        {/* DIMENSION: Height 100 */}
        <line x1="250" y1="50" x2="285" y2="50" stroke="#101418" strokeWidth="0.8" />
        <line x1="250" y1="250" x2="285" y2="250" stroke="#101418" strokeWidth="0.8" />
        <line x1="275" y1="50" x2="275" y2="250" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" markerEnd="url(#arrow)" />
        <rect x="261" y="142" width="28" height="16" fill="#FFFBF0" />
        <text x="275" y="154" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="monospace" fill="#101418">100</text>

        {/* LEADER: Central Bore Ø60 (Finding #2 - Missing tolerance) */}
        <line x1="100" y1="120" x2="30" y2="70" stroke="#D92D20" strokeWidth="1.3" markerStart="url(#arrow-rev)" />
        <line x1="30" y1="70" x2="-45" y2="70" stroke="#D92D20" strokeWidth="1.3" />
        <rect x="-42" y="58" width="70" height="15" fill="#FFF3C4" stroke="#D92D20" strokeWidth="1" rx="2" />
        <text x="-7" y="69" textAnchor="middle" fontSize="9.5" fontWeight="800" fontFamily="monospace" fill="#D92D20">Ø60 (NO TOL)</text>

        {/* LEADER: 4X Ø10 Corner Holes */}
        <line x1="196.5" y1="93.5" x2="245" y2="75" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" />
        <line x1="245" y1="75" x2="295" y2="75" stroke="#101418" strokeWidth="1.2" />
        <text x="300" y="78" textAnchor="start" fontSize="9.5" fontWeight="700" fontFamily="monospace" fill="#101418">4X Ø10</text>

        {/* LEADER: Bolt Circle Ø80 (Finding #1 - Undimensioned) */}
        <line x1="200" y1="180" x2="250" y2="210" stroke="#D92D20" strokeWidth="1.3" strokeDasharray="3,2" markerStart="url(#arrow-rev)" />
        <line x1="250" y1="210" x2="330" y2="210" stroke="#D92D20" strokeWidth="1.3" />
        <rect x="252" y="198" width="78" height="15" fill="#FFF3C4" stroke="#D92D20" strokeWidth="1" rx="2" />
        <text x="291" y="209" textAnchor="middle" fontSize="8.5" fontWeight="800" fontFamily="monospace" fill="#D92D20">BC Ø80 (UNDIM)</text>
      </g>

      {/* VIEW 2: SIDE VIEW (Thin 100x12 strip) */}
      <g transform="translate(360, 420)">
        <text x="0" y="0" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418" letterSpacing="1">
          SIDE VIEW (2:1)
        </text>

        {/* Strip: 200 width, 24 thickness (12mm at 2:1) */}
        <rect x="40" y="40" width="200" height="24" fill="#FFFBF0" stroke="#101418" strokeWidth="2.2" />

        {/* Hidden lines for central bore (Ø60 at 2:1 -> from x=80 to x=200) */}
        <line x1="80" y1="40" x2="80" y2="64" stroke="#101418" strokeWidth="1.2" strokeDasharray="4,3" />
        <line x1="200" y1="40" x2="200" y2="64" stroke="#101418" strokeWidth="1.2" strokeDasharray="4,3" />
        <line x1="140" y1="30" x2="140" y2="74" stroke="#1E43D8" strokeWidth="0.8" strokeDasharray="8,3" />

        {/* Hidden lines for holes at 83.5 and 196.5 */}
        <line x1="73.5" y1="40" x2="73.5" y2="64" stroke="#101418" strokeWidth="1" strokeDasharray="3,2" />
        <line x1="93.5" y1="40" x2="93.5" y2="64" stroke="#101418" strokeWidth="1" strokeDasharray="3,2" />
        <line x1="186.5" y1="40" x2="186.5" y2="64" stroke="#101418" strokeWidth="1" strokeDasharray="3,2" />
        <line x1="206.5" y1="40" x2="206.5" y2="64" stroke="#101418" strokeWidth="1" strokeDasharray="3,2" />

        {/* Thickness dimension 12 */}
        <line x1="250" y1="40" x2="280" y2="40" stroke="#101418" strokeWidth="0.8" />
        <line x1="250" y1="64" x2="280" y2="64" stroke="#101418" strokeWidth="0.8" />
        <line x1="270" y1="40" x2="270" y2="64" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" markerEnd="url(#arrow)" />
        <rect x="274" y="44" width="20" height="15" fill="#FFFBF0" />
        <text x="284" y="55" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="monospace" fill="#101418">12</text>

        {/* Datum Feature Symbol A on bottom face */}
        <g transform="translate(140, 64)">
          <line x1="0" y1="0" x2="0" y2="18" stroke="#101418" strokeWidth="1.5" />
          <polygon points="0,0 -6,-10 6,-10" fill="#101418" />
          <rect x="-9" y="18" width="18" height="18" fill="#FFFBF0" stroke="#101418" strokeWidth="1.5" />
          <text x="0" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="monospace" fill="#101418">A</text>
        </g>
      </g>

      {/* VIEW 3: ISOMETRIC AXONOMETRIC (2:1) */}
      <g transform="translate(750, 90)">
        <text x="40" y="20" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418" letterSpacing="1">
          ISOMETRIC (2:1)
        </text>
        <g transform="translate(60, 45) scale(0.9)">
          <polygon points="120,20 230,75 230,95 120,40" fill="#DCE7FB" stroke="#101418" strokeWidth="2" />
          <polygon points="10,75 120,20 120,40 10,95" fill="#FFFBF0" stroke="#101418" strokeWidth="2" />
          <polygon points="10,75 120,20 230,75 120,130" fill="#E8EEFC" stroke="#101418" strokeWidth="2" />
          <polygon points="10,95 120,40 230,95 120,150" fill="#FFFBF0" stroke="#101418" strokeWidth="2" />
          <polygon points="10,75 10,95 120,150 120,130" fill="#DCE7FB" stroke="#101418" strokeWidth="2" />
          <polygon points="120,130 120,150 230,95 230,75" fill="#BCCEEF" stroke="#101418" strokeWidth="2" />

          {/* Central Bore Ellipse */}
          <ellipse cx="120" cy="75" rx="36" ry="18" fill="#FFFBF0" stroke="#101418" strokeWidth="1.8" />
          <ellipse cx="120" cy="85" rx="36" ry="18" fill="none" stroke="#101418" strokeWidth="1" strokeDasharray="3,2" />

          {/* 4 Corner Holes Isometric Ellipses */}
          <ellipse cx="65" cy="52" rx="7" ry="3.5" fill="#FFFBF0" stroke="#101418" strokeWidth="1.4" />
          <ellipse cx="175" cy="52" rx="7" ry="3.5" fill="#FFFBF0" stroke="#101418" strokeWidth="1.4" />
          <ellipse cx="65" cy="98" rx="7" ry="3.5" fill="#FFFBF0" stroke="#101418" strokeWidth="1.4" />
          <ellipse cx="175" cy="98" rx="7" ry="3.5" fill="#FFFBF0" stroke="#101418" strokeWidth="1.4" />
        </g>
      </g>
    </>
  );
}

// =============================================================================
// VARIANT C VIEWS (BEARING HOUSING: 140x90, DUAL BORES Ø40 & Ø35, SECTION A-A)
// =============================================================================

function VariantCViews() {
  return (
    <>
      {/* VIEW 1: FRONT VIEW (140x90 rectangle, two bearing bores Ø40 and Ø35 side by side, 4x M8 holes) */}
      <g transform="translate(350, 90)">
        <text x="0" y="24" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418" letterSpacing="1">
          FRONT VIEW (PRIMARY)
        </text>

        {/* Centerlines through bores */}
        <line x1="-20" y1="140" x2="310" y2="140" stroke="#1E43D8" strokeWidth="0.9" strokeDasharray="12,3,2,3" />
        <line x1="95" y1="20" x2="95" y2="260" stroke="#1E43D8" strokeWidth="0.9" strokeDasharray="12,3,2,3" />
        <line x1="195" y1="20" x2="195" y2="260" stroke="#1E43D8" strokeWidth="0.9" strokeDasharray="12,3,2,3" />

        {/* Main 140x90 Block (rendered 280x180) */}
        <rect x="10" y="50" width="280" height="180" rx="14" fill="#FFFBF0" stroke="#101418" strokeWidth="2.2" />

        {/* Dual Bearing Bores: Left Ø40 (r=36), Right Ø35 (r=30) */}
        <circle cx="95" cy="140" r="36" fill="#E8EEFC" stroke="#101418" strokeWidth="2" />
        <circle cx="195" cy="140" r="30" fill="#E8EEFC" stroke="#101418" strokeWidth="2" />

        {/* Rib Centerlines & Structural Rib Outline */}
        <path d="M 145 50 L 145 230" stroke="#1E43D8" strokeWidth="1" strokeDasharray="8,3" />
        <rect x="135" y="70" width="20" height="140" fill="none" stroke="#101418" strokeWidth="1.2" strokeDasharray="4,3" />

        {/* 4x M8 Corner Mounting Holes */}
        {[
          { cx: 35, cy: 75 },
          { cx: 265, cy: 75 },
          { cx: 35, cy: 205 },
          { cx: 265, cy: 205 },
        ].map((pt, i) => (
          <g key={i}>
            <circle cx={pt.cx} cy={pt.cy} r="8" fill="#FFFBF0" stroke="#101418" strokeWidth="1.5" />
            <circle cx={pt.cx} cy={pt.cy} r="6" fill="none" stroke="#101418" strokeWidth="0.9" strokeDasharray="2,2" />
          </g>
        ))}

        {/* DIMENSION: Width 140 */}
        <line x1="10" y1="40" x2="10" y2="15" stroke="#101418" strokeWidth="0.8" />
        <line x1="290" y1="40" x2="290" y2="15" stroke="#101418" strokeWidth="0.8" />
        <line x1="10" y1="20" x2="290" y2="20" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" markerEnd="url(#arrow)" />
        <rect x="135" y="12" width="30" height="16" fill="#FFFBF0" />
        <text x="150" y="24" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="monospace" fill="#101418">140</text>

        {/* DIMENSION: Height 90 */}
        <line x1="300" y1="50" x2="335" y2="50" stroke="#101418" strokeWidth="0.8" />
        <line x1="300" y1="230" x2="335" y2="230" stroke="#101418" strokeWidth="0.8" />
        <line x1="325" y1="50" x2="325" y2="230" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" markerEnd="url(#arrow)" />
        <rect x="312" y="132" width="26" height="16" fill="#FFFBF0" />
        <text x="325" y="144" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="monospace" fill="#101418">90</text>

        {/* FINDING #2: Center-to-center Bore Spacing 70 (UNDIMENSIONED) */}
        <line x1="95" y1="140" x2="95" y2="100" stroke="#D92D20" strokeWidth="1" strokeDasharray="3,2" />
        <line x1="195" y1="140" x2="195" y2="100" stroke="#D92D20" strokeWidth="1" strokeDasharray="3,2" />
        <line x1="95" y1="105" x2="195" y2="105" stroke="#D92D20" strokeWidth="1.3" strokeDasharray="4,2" markerStart="url(#arrow-rev)" markerEnd="url(#arrow)" />
        <rect x="110" y="93" width="70" height="15" fill="#FFF3C4" stroke="#D92D20" strokeWidth="1" rx="2" />
        <text x="145" y="104" textAnchor="middle" fontSize="8.5" fontWeight="800" fontFamily="monospace" fill="#D92D20">70 (UNDIM)</text>

        {/* FINDING #1: Left Bore Ø40 (Concentricity to Datum A unspecified) */}
        <line x1="95" y1="104" x2="50" y2="70" stroke="#D92D20" strokeWidth="1.3" markerStart="url(#arrow-rev)" />
        <line x1="50" y1="70" x2="-25" y2="70" stroke="#D92D20" strokeWidth="1.3" />
        <rect x="-22" y="58" width="80" height="15" fill="#FFF3C4" stroke="#D92D20" strokeWidth="1" rx="2" />
        <text x="18" y="69" textAnchor="middle" fontSize="8.5" fontWeight="800" fontFamily="monospace" fill="#D92D20">Ø40 (NO CONC)</text>

        {/* LEADER: Right Bore Ø35 */}
        <line x1="195" y1="110" x2="225" y2="75" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" />
        <line x1="225" y1="75" x2="265" y2="75" stroke="#101418" strokeWidth="1.2" />
        <text x="270" y="78" textAnchor="start" fontSize="9.5" fontWeight="700" fontFamily="monospace" fill="#101418">Ø35</text>

        {/* LEADER: 4X M8 Holes */}
        <line x1="35" y1="205" x2="-5" y2="225" stroke="#101418" strokeWidth="1.2" markerStart="url(#arrow-rev)" />
        <line x1="-5" y1="225" x2="-45" y2="225" stroke="#101418" strokeWidth="1.2" />
        <text x="-40" y="220" textAnchor="start" fontSize="9.5" fontWeight="700" fontFamily="monospace" fill="#101418">4X M8</text>
      </g>

      {/* VIEW 2: SECTION VIEW A-A (Stepped block with hatch lines) */}
      <g transform="translate(350, 420)">
        <text x="0" y="0" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418" letterSpacing="1">
          SECTION VIEW A-A (CROSS-SECTION)
        </text>

        {/* Section Profile Outline with Stepped Bores */}
        <path
          d="M 10 40 L 70 40 L 70 65 L 120 65 L 120 40 L 170 40 L 170 70 L 220 70 L 220 40 L 290 40 L 290 140 L 10 140 Z"
          fill="#FFFBF0"
          stroke="#101418"
          strokeWidth="2.2"
        />

        {/* Hatching Diagonal Lines for Cast Aluminum */}
        {[30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250, 270].map((hx, idx) => (
          <line
            key={idx}
            x1={hx}
            y1={140}
            x2={hx + 40}
            y2={80}
            stroke="#3E6BE0"
            strokeWidth="0.8"
            opacity="0.45"
          />
        ))}

        {/* Bottom Baseline Datum A */}
        <g transform="translate(150, 140)">
          <line x1="0" y1="0" x2="0" y2="18" stroke="#101418" strokeWidth="1.5" />
          <polygon points="0,0 -6,-10 6,-10" fill="#101418" />
          <rect x="-9" y="18" width="18" height="18" fill="#FFFBF0" stroke="#101418" strokeWidth="1.5" />
          <text x="0" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="monospace" fill="#101418">A</text>
        </g>
      </g>

      {/* VIEW 3: ISOMETRIC AXONOMETRIC */}
      <g transform="translate(750, 90)">
        <text x="40" y="20" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#101418" letterSpacing="1">
          ISOMETRIC (1:1)
        </text>
        <g transform="translate(60, 45) scale(0.85)">
          <polygon points="20,80 140,20 260,80 140,140" fill="#E8EEFC" stroke="#101418" strokeWidth="2" />
          <polygon points="20,80 20,130 140,190 140,140" fill="#FFFBF0" stroke="#101418" strokeWidth="2" />
          <polygon points="140,140 140,190 260,130 260,80" fill="#DCE7FB" stroke="#101418" strokeWidth="2" />

          {/* Left Bore Ellipse */}
          <ellipse cx="95" cy="75" rx="26" ry="14" fill="#FFFBF0" stroke="#101418" strokeWidth="1.8" />
          <ellipse cx="95" cy="95" rx="26" ry="14" fill="none" stroke="#101418" strokeWidth="1" strokeDasharray="3,2" />

          {/* Right Bore Ellipse */}
          <ellipse cx="185" cy="75" rx="22" ry="12" fill="#FFFBF0" stroke="#101418" strokeWidth="1.8" />
          <ellipse cx="185" cy="95" rx="22" ry="12" fill="none" stroke="#101418" strokeWidth="1" strokeDasharray="3,2" />

          {/* Structural Center Gusset */}
          <line x1="140" y1="20" x2="140" y2="140" stroke="#1E43D8" strokeWidth="1.4" strokeDasharray="4,2" />
        </g>
      </g>
    </>
  );
}
