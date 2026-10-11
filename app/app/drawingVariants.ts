import React from "react";

export interface DrawingIssue {
  id: number;
  severity: "warning" | "info" | "MAJOR" | "MINOR";
  description: string;
  detail: string;
  resolution: string;
}

export interface TitleBlockData {
  title: string;
  dwgNo: string;
  material: string;
  finish: string;
  rev: string;
  revStatus: string;
  scale: string;
  drawnBy: string;
  date: string;
  sheet: string;
}

export interface DrawingVariant {
  id: "variant-a" | "variant-b" | "variant-c";
  variantKey: "A" | "B" | "C";
  name: string;
  downloadFileName: string;
  titleBlock: TitleBlockData;
  notes: string[];
  issues: DrawingIssue[];
  stats: {
    warningsCount: number;
    optimalCount: number;
    dimensionsPlaced: number;
    timeGenerated: string;
  };
}

// =============================================================================
// VARIANT A: CLEVIS MOUNT BRACKET (14 ISSUES - VERBATIM EXISTING)
// =============================================================================

const VARIANT_A_ISSUES: DrawingIssue[] = [
  {
    id: 1,
    severity: "warning",
    description: "Tight clearance on datum B callout",
    detail: "Callout positioned 6mm from edge fillet F14; offset adjusted +4mm into clear margin.",
    resolution: "Resolved (Offset +4mm)",
  },
  {
    id: 2,
    severity: "warning",
    description: "Extension line proximity to bounding boundary on D9",
    detail: "Primary horizontal baseline 150mm was within 2mm of sheet border line.",
    resolution: "Resolved (Shifted view 12mm up)",
  },
  {
    id: 3,
    severity: "info",
    description: "Dimension text overlap between D4 and D5",
    detail: "Vertical dimension lines 126mm and 88mm shared overlapping placement lane.",
    resolution: "Resolved (Staggered dimension ladders)",
  },
  {
    id: 4,
    severity: "info",
    description: "Leader line intersection on D1 (2X Ø10 THRU)",
    detail: "Leader dogleg crossed hidden center-mark lines.",
    resolution: "Resolved (Angled leader 45° north-east)",
  },
  {
    id: 5,
    severity: "info",
    description: "Arrowhead direction inverted on D3 (12mm)",
    detail: "Span < 15mm required external arrowheads pointing inwards.",
    resolution: "Resolved (External arrowheads applied)",
  },
  {
    id: 6,
    severity: "info",
    description: "Centermark generation for counterbore holes F1 & F2",
    detail: "ASME Y14.2 centerline crosshairs placed across mating faces #11 and #12.",
    resolution: "Resolved (Placed)",
  },
  {
    id: 7,
    severity: "info",
    description: "Projection alignment between front and right views",
    detail: "Horizontal baseline alignment verified at 520px datum plane.",
    resolution: "Verified (Co-planar)",
  },
  {
    id: 8,
    severity: "info",
    description: "Projection alignment between top and front views",
    detail: "Vertical centerline alignment verified at 380px datum plane.",
    resolution: "Verified (Co-planar)",
  },
  {
    id: 9,
    severity: "info",
    description: "Dimension D8 (R6 TYP) radial arc clearance",
    detail: "Radial dimension leader placed on external convex corner.",
    resolution: "Resolved (Clean arc)",
  },
  {
    id: 10,
    severity: "info",
    description: "General notes boundary clipping check",
    detail: "Note block evaluated against Zone A1 / B2 margins.",
    resolution: "Verified (Clean bounds)",
  },
  {
    id: 11,
    severity: "info",
    description: "Title block compliance per ASME Y14.1M",
    detail: "Metric projection third-angle symbol rendered and validated.",
    resolution: "Verified (Standardized)",
  },
  {
    id: 12,
    severity: "info",
    description: "Datum feature symbol attachments A, B, C",
    detail: "Datum symbols boxed and attached directly to designated functional faces.",
    resolution: "Resolved (Attached)",
  },
  {
    id: 13,
    severity: "info",
    description: "Hidden line dash pitch standardization",
    detail: "Calculated stroke dasharray 4,3 across hidden inner bores.",
    resolution: "Resolved (Applied)",
  },
  {
    id: 14,
    severity: "info",
    description: "Sheet fill density balance",
    detail: "View bounding box occupancy calculated at 68% optimal sheet envelope.",
    resolution: "Verified (Balanced)",
  },
];

export const VARIANT_A: DrawingVariant = {
  id: "variant-a",
  variantKey: "A",
  name: "Clevis mount bracket",
  downloadFileName: "clevis-smart.svg",
  titleBlock: {
    title: "CLEVIS MOUNT BRACKET",
    dwgNo: "MF-2026-0881",
    material: "6061-T6 ALUMINUM",
    finish: "CLEAR ANODIZE",
    rev: "REV A",
    revStatus: "REV A (APPROVED)",
    scale: "1:1",
    drawnBy: "ASTRAEA AGENT",
    date: "2026-09-26",
    sheet: "1 OF 1 (A3)",
  },
  notes: [
    "1. ALL DIMENSIONS ARE IN MILLIMETERS [MM].",
    "2. TOLERANCES: .X ±0.2, .XX ±0.05, ANG ±0.5°.",
    "3. BREAK ALL SHARP EDGES R0.3 MAX.",
    "4. MATERIAL: 6061-T6 ALUMINUM ALLOY.",
    "5. FINISH: CLEAR ANODIZE MIL-A-8625 TYPE II.",
  ],
  issues: VARIANT_A_ISSUES,
  stats: {
    warningsCount: 2,
    optimalCount: 12,
    dimensionsPlaced: 14,
    timeGenerated: "10m 9s",
  },
};

// =============================================================================
// VARIANT B: MOUNTING FLANGE (9 ISSUES: 2 MAJOR, 7 MINOR)
// =============================================================================

const VARIANT_B_ISSUES: DrawingIssue[] = [
  {
    id: 1,
    severity: "warning",
    description: "Bolt-circle pitch undimensioned — the Ø80 circle is drawn but has no dimension. NEEDED: Ø80.00 ±0.05.",
    detail: "Pitch circle diameter drawn with centerline dash but missing leader annotation. NEEDED: Ø80.00 ±0.05.",
    resolution: "Flagged (Needs dimension)",
  },
  {
    id: 2,
    severity: "warning",
    description: "Ø60 bore has no tolerance callout. NEEDED: Ø60 H7.",
    detail: "Central bore feature specified nominal without fit class. NEEDED: Ø60 H7 (+0.030 / +0.000).",
    resolution: "Flagged (Tolerance required)",
  },
  {
    id: 3,
    severity: "info",
    description: "Surface finish symbol absent on the mounting face.",
    detail: "Primary mating face requires Ra 1.6 μm callout per machining spec.",
    resolution: "Resolved (Assigned general note Ra 3.2)",
  },
  {
    id: 4,
    severity: "info",
    description: "Corner hole Ø10 depth: THRU implied, not stated.",
    detail: "Four perimeter holes lack explicit 'THRU' or blind depth symbol.",
    resolution: "Resolved ('THRU' annotated)",
  },
  {
    id: 5,
    severity: "info",
    description: "Title block material '1018 STEEL' vs file rev note mismatch — verify heat treat.",
    detail: "Rev note references normalized condition; verify stock code.",
    resolution: "Verified (Carbon steel)",
  },
  {
    id: 6,
    severity: "info",
    description: "Plate thickness 12 appears only in the side view.",
    detail: "Stock thickness dimension isolated to peripheral right projection.",
    resolution: "Resolved (Cross-referenced)",
  },
  {
    id: 7,
    severity: "info",
    description: "Isometric view shows no hidden lines.",
    detail: "Axonometric view rendered in clean wireframe without dashed inner bores.",
    resolution: "Verified (Standard practice)",
  },
  {
    id: 8,
    severity: "info",
    description: "Dimension '100' lacks units note reference.",
    detail: "Overall width and height 100mm inherit sheet general note 1.",
    resolution: "Verified (Note 1 invoked)",
  },
  {
    id: 9,
    severity: "info",
    description: "Scale 2:1 vs sheet size A3 — borderline legible.",
    detail: "View bounding box fills 62% of usable drawing zone margin.",
    resolution: "Resolved (Margins balanced)",
  },
];

export const VARIANT_B: DrawingVariant = {
  id: "variant-b",
  variantKey: "B",
  name: "Mounting flange",
  downloadFileName: "flange-smart.svg",
  titleBlock: {
    title: "MOUNTING FLANGE",
    dwgNo: "MF-2026-0912",
    material: "1018 STEEL",
    finish: "ZINC PLATE",
    rev: "REV B",
    revStatus: "REV B (APPROVED)",
    scale: "2:1",
    drawnBy: "ASTRAEA AGENT",
    date: "2026-10-10",
    sheet: "1 OF 1 (A3)",
  },
  notes: [
    "1. ALL DIMENSIONS ARE IN MILLIMETERS [MM].",
    "2. TOLERANCES: .X ±0.1, .XX ±0.02, ANG ±0.25°.",
    "3. MATERIAL: 1018 COLD DRAWN CARBON STEEL.",
    "4. FINISH: ZINC ELECTROPLATE PER ASTM B633 TYPE II.",
    "5. BREAK ALL SHARP EDGES R0.5 MAX.",
  ],
  issues: VARIANT_B_ISSUES,
  stats: {
    warningsCount: 2,
    optimalCount: 7,
    dimensionsPlaced: 9,
    timeGenerated: "8m 42s",
  },
};

// =============================================================================
// VARIANT C: BEARING HOUSING (6 ISSUES: 2 MAJOR, 4 MINOR)
// =============================================================================

const VARIANT_C_ISSUES: DrawingIssue[] = [
  {
    id: 1,
    severity: "warning",
    description: "Ø40 bore concentricity to datum A not specified.",
    detail: "High-speed bearing seat lacks coaxial runout or concentricity control to datum A.",
    resolution: "Flagged (Datum control needed)",
  },
  {
    id: 2,
    severity: "warning",
    description: "Bore spacing 70 between Ø40 and Ø35 undimensioned. NEEDED: 70.00 ±0.03.",
    detail: "Centerline distance between dual bores missing basic coordinate dimension. NEEDED: 70.00 ±0.03.",
    resolution: "Flagged (Center distance needed)",
  },
  {
    id: 3,
    severity: "info",
    description: "Rib fillet radius unspecified.",
    detail: "Internal structural casting gussets lack R3 or R5 radius callout.",
    resolution: "Resolved (Applied general note R4 TYP)",
  },
  {
    id: 4,
    severity: "info",
    description: "M8 holes: thread depth not called out.",
    detail: "Four perimeter tapped holes show pitch M8x1.25 but lack minimum thread depth.",
    resolution: "Resolved (Assigned 16mm depth)",
  },
  {
    id: 5,
    severity: "info",
    description: "Casting draft angle absent from notes.",
    detail: "Draft 1.5° required on unmachined cast sidewalls for die release.",
    resolution: "Resolved (Note 4 added)",
  },
  {
    id: 6,
    severity: "info",
    description: "Section view lacks cutting-plane arrows.",
    detail: "Section A-A cut line drawn on front view without direction arrows A-A.",
    resolution: "Resolved (Cutting arrows placed)",
  },
];

export const VARIANT_C: DrawingVariant = {
  id: "variant-c",
  variantKey: "C",
  name: "Bearing housing",
  downloadFileName: "housing-smart.svg",
  titleBlock: {
    title: "BEARING HOUSING",
    dwgNo: "MF-2026-1077",
    material: "A356-T6 ALUMINUM",
    finish: "AS CAST + MACHINED",
    rev: "REV C",
    revStatus: "REV C (APPROVED)",
    scale: "1:1",
    drawnBy: "ASTRAEA AGENT",
    date: "2026-10-10",
    sheet: "1 OF 1 (A3)",
  },
  notes: [
    "1. ALL DIMENSIONS ARE IN MILLIMETERS [MM].",
    "2. UNTOLERANCED DIMENSIONS ±0.25mm, ANG ±0.5°.",
    "3. MATERIAL: PERMANENT MOLD CAST ALUMINUM A356-T6.",
    "4. FINISH: AS CAST + PRECISION MACHINED BORES.",
    "5. CASTING DRAFT ANGLE 1.5° UNLESS NOTED.",
  ],
  issues: VARIANT_C_ISSUES,
  stats: {
    warningsCount: 2,
    optimalCount: 4,
    dimensionsPlaced: 11,
    timeGenerated: "9m 15s",
  },
};

export const VARIANTS: Record<string, DrawingVariant> = {
  "variant-a": VARIANT_A,
  "variant-b": VARIANT_B,
  "variant-c": VARIANT_C,
};

/**
 * Deterministically maps an uploaded STEP filename to a drawing variant.
 * - Normalized === "clevis.step" -> VARIANT A (Clevis bracket)
 * - Any other filename -> deterministic sum of char codes: even -> B (Flange), odd -> C (Housing)
 */
export function getDrawingVariant(fileName: string = "clevis.step"): DrawingVariant {
  const normalized = (fileName || "").toLowerCase().trim();

  if (normalized === "clevis.step" || normalized === "clevis") {
    return VARIANT_A;
  }

  // Deterministic mapping by char code sum: even -> B (Flange), odd -> C (Housing)
  const sum = normalized.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return sum % 2 === 0 ? VARIANT_B : VARIANT_C;
}

