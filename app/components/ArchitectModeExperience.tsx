"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";

// =============================================================================
// 1. 3D GEOMETRY DEFINITION FOR PRECISION INDUSTRIAL SPINDLE / CLEVIS ASSEMBLY
// =============================================================================

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Face3D {
  indices: number[];
  color: [number, number, number]; // Base RGB
  highlight?: boolean;
  wireframeOnly?: boolean;
}

interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
  visible: boolean;
}

// Generate procedurally accurate industrial geometry
function createIndustrialAssemblyGeometry(): {
  vertices: Point3D[];
  faces: Face3D[];
  edges: [number, number][];
} {
  const vertices: Point3D[] = [];
  const faces: Face3D[] = [];
  const edges: [number, number][] = [];

  // Helper to add vertex
  const addV = (x: number, y: number, z: number): number => {
    vertices.push({ x, y, z });
    return vertices.length - 1;
  };

  // Helper to add edge
  const addEdge = (a: number, b: number) => {
    edges.push([a, b]);
  };

  // 1. Base Mounting Flange: -110 to +110 X, +45 to +75 Y, -65 to +65 Z
  const bX = 110;
  const bY0 = 45;
  const bY1 = 75;
  const bZ = 65;

  const b0 = addV(-bX, bY1, -bZ); // Top-left-back
  const b1 = addV(bX, bY1, -bZ);  // Top-right-back
  const b2 = addV(bX, bY1, bZ);   // Top-right-front
  const b3 = addV(-bX, bY1, bZ);  // Top-left-front

  const b4 = addV(-bX, bY0, -bZ); // Bottom-left-back
  const b5 = addV(bX, bY0, -bZ);  // Bottom-right-back
  const b6 = addV(bX, bY0, bZ);   // Bottom-right-front
  const b7 = addV(-bX, bY0, bZ);  // Bottom-left-front

  // Base faces
  faces.push({ indices: [b0, b1, b2, b3], color: [226, 232, 240] }); // Top
  faces.push({ indices: [b7, b6, b5, b4], color: [100, 116, 139] }); // Bottom
  faces.push({ indices: [b3, b2, b6, b7], color: [148, 163, 184] }); // Front
  faces.push({ indices: [b1, b0, b4, b5], color: [71, 85, 105] });   // Back
  faces.push({ indices: [b0, b3, b7, b4], color: [100, 116, 139] }); // Left
  faces.push({ indices: [b2, b1, b5, b6], color: [148, 163, 184] }); // Right

  // Base edges
  addEdge(b0, b1); addEdge(b1, b2); addEdge(b2, b3); addEdge(b3, b0);
  addEdge(b4, b5); addEdge(b5, b6); addEdge(b6, b7); addEdge(b7, b4);
  addEdge(b0, b4); addEdge(b1, b5); addEdge(b2, b6); addEdge(b3, b7);

  // 2. Main Machined Housing Body (Center block)
  // X: -65 to +65, Y: -45 to +45, Z: -50 to +50
  const mX = 65;
  const mY0 = -45;
  const mY1 = 45;
  const mZ = 50;

  const m0 = addV(-mX, mY0, -mZ);
  const m1 = addV(mX, mY0, -mZ);
  const m2 = addV(mX, mY0, mZ);
  const m3 = addV(-mX, mY0, mZ);

  const m4 = addV(-mX, mY1, -mZ);
  const m5 = addV(mX, mY1, -mZ);
  const m6 = addV(mX, mY1, mZ);
  const m7 = addV(-mX, mY1, mZ);

  faces.push({ indices: [m0, m1, m2, m3], color: [241, 245, 249] }); // Top
  faces.push({ indices: [m3, m2, m6, m7], color: [168, 182, 202] }); // Front
  faces.push({ indices: [m1, m0, m4, m5], color: [88, 102, 122] });  // Back
  faces.push({ indices: [m0, m3, m7, m4], color: [120, 134, 154] }); // Left
  faces.push({ indices: [m2, m1, m5, m6], color: [180, 194, 214] }); // Right

  addEdge(m0, m1); addEdge(m1, m2); addEdge(m2, m3); addEdge(m3, m0);
  addEdge(m4, m5); addEdge(m5, m6); addEdge(m6, m7); addEdge(m7, m4);
  addEdge(m0, m4); addEdge(m1, m5); addEdge(m2, m6); addEdge(m3, m7);

  // 3. Central Precision Spindle Cylinder (16-sided polygon)
  const segments = 16;
  const cylRadius = 40;
  const cylYTop = -95;
  const cylYBottom = -45;

  const topCylIndices: number[] = [];
  const botCylIndices: number[] = [];

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * cylRadius;
    const z = Math.sin(angle) * cylRadius;
    topCylIndices.push(addV(x, cylYTop, z));
    botCylIndices.push(addV(x, cylYBottom, z));
  }

  // Cylindrical side faces
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const tA = topCylIndices[i];
    const tB = topCylIndices[next];
    const bB = botCylIndices[next];
    const bA = botCylIndices[i];

    // Surface normal based on angle
    const angle = (i / segments) * Math.PI * 2;
    const nx = Math.cos(angle);
    const nz = Math.sin(angle);
    // Lighting modulation
    const light = Math.max(0.2, (nx * 0.5 + nz * 0.7 + 0.3));
    const r = Math.round(180 + light * 60);
    const g = Math.round(195 + light * 50);
    const bVal = Math.round(215 + light * 35);

    faces.push({
      indices: [tA, tB, bB, bA],
      color: [r, g, bVal],
    });

    addEdge(tA, tB);
    addEdge(tA, bA);
  }

  // Top Cap of Spindle Nose
  faces.push({
    indices: topCylIndices,
    color: [248, 250, 252],
    highlight: true,
  });

  // 4. Central Bore Hole (Tapered inner bore)
  const innerRadius = 24;
  const boreTopIndices: number[] = [];
  const boreBotIndices: number[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * innerRadius;
    const z = Math.sin(angle) * innerRadius;
    boreTopIndices.push(addV(x, cylYTop, z));
    boreBotIndices.push(addV(x, cylYTop + 30, z));
  }

  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    faces.push({
      indices: [boreTopIndices[i], boreTopIndices[next], boreBotIndices[next], boreBotIndices[i]],
      color: [30, 41, 59], // Dark interior bore
    });
    addEdge(boreTopIndices[i], boreTopIndices[next]);
  }

  // 5. Twin Actuator Pivot Ears / Clevis Arms (Left & Right)
  const earY0 = -20;
  const earY1 = 30;
  const earW = 16;
  const earZ = 35;

  // Left ear (-90 to -74 X)
  const leX0 = -90;
  const leX1 = -74;
  const le0 = addV(leX0, earY0, -earZ);
  const le1 = addV(leX1, earY0, -earZ);
  const le2 = addV(leX1, earY0, earZ);
  const le3 = addV(leX0, earY0, earZ);
  const le4 = addV(leX0, earY1, -earZ);
  const le5 = addV(leX1, earY1, -earZ);
  const le6 = addV(leX1, earY1, earZ);
  const le7 = addV(leX0, earY1, earZ);

  faces.push({ indices: [le0, le1, le2, le3], color: [210, 220, 235] });
  faces.push({ indices: [le3, le2, le6, le7], color: [160, 175, 195] });
  faces.push({ indices: [le0, le3, le7, le4], color: [120, 135, 155] });
  faces.push({ indices: [le2, le1, le5, le6], color: [175, 190, 210] });

  addEdge(le0, le1); addEdge(le1, le2); addEdge(le2, le3); addEdge(le3, le0);
  addEdge(le4, le5); addEdge(le5, le6); addEdge(le6, le7); addEdge(le7, le4);
  addEdge(le0, le4); addEdge(le1, le5); addEdge(le2, le6); addEdge(le3, le7);

  // Right ear (+74 to +90 X)
  const reX0 = 74;
  const reX1 = 90;
  const re0 = addV(reX0, earY0, -earZ);
  const re1 = addV(reX1, earY0, -earZ);
  const re2 = addV(reX1, earY0, earZ);
  const re3 = addV(reX0, earY0, earZ);
  const re4 = addV(reX0, earY1, -earZ);
  const re5 = addV(reX1, earY1, -earZ);
  const re6 = addV(reX1, earY1, earZ);
  const re7 = addV(reX0, earY1, earZ);

  faces.push({ indices: [re0, re1, re2, re3], color: [220, 230, 245] });
  faces.push({ indices: [re3, re2, re6, re7], color: [170, 185, 205] });
  faces.push({ indices: [re0, re3, re7, re4], color: [130, 145, 165] });
  faces.push({ indices: [re2, re1, re5, re6], color: [185, 200, 220] });

  addEdge(re0, re1); addEdge(re1, re2); addEdge(re2, re3); addEdge(re3, re0);
  addEdge(re4, re5); addEdge(re5, re6); addEdge(re6, re7); addEdge(re7, re4);
  addEdge(re0, re4); addEdge(re1, re5); addEdge(re2, re6); addEdge(re3, re7);

  return { vertices, faces, edges };
}

// =============================================================================
// 2. MAIN COMPONENT: ARCHITECT MODE EXPERIENCE
// =============================================================================

export function ArchitectModeExperience() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scroll Progress (0 to 1) through the pinned runway
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  // Pre-calculate 3D geometry once
  const geometry = useMemo(() => createIndustrialAssemblyGeometry(), []);

  // Monitor user preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Track scroll position through the pinned runway
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable > 0) {
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Update canvas bounds on resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          setDimensions({
            width: parent.clientWidth,
            height: parent.clientHeight,
          });
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Tolerance Error Detection Visibility:
  // After 2D blueprint is established (0.70 -> 0.82), highlight the tolerance error in one dimension (0.83 -> 1.00)
  const errorProgress = useMemo(() => {
    if (prefersReducedMotion) return 1;
    if (scrollProgress < 0.82) return 0;
    if (scrollProgress > 0.90) return 1;
    return (scrollProgress - 0.82) / (0.90 - 0.82);
  }, [scrollProgress, prefersReducedMotion]);

  const isErrorState = errorProgress > 0.35;

  // ===========================================================================
  // 3. RENDER 3D CANVAS & TRANSFORMATION (Canvas 2D Graphics Loop)
  // ===========================================================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const width = dimensions.width;
    const height = dimensions.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Timeline phases (3D to 2D Autodrafting Transformation):
    // 0.00 - 0.25 : Stage 1 - 3D Volumetric CAD Solid (Machined geometry, metallic shading & lighting)
    // 0.25 - 0.48 : Stage 2 - Feature Metrology & Inspection Cards Drift In around 3D Solid
    // 0.48 - 0.72 : Stage 3 - Orthographic Projection (Smooth rotation to front plane & 3D -> 2D flattening)
    // 0.72 - 0.88 : Stage 4 - 2D Technical Sketch & ASME Y14.5 Dimensioned Blueprint Callouts
    // 0.88 - 1.00 : Stage 5 - Settled 2D Blueprint & Smooth Unpinning into Footer
    const p = prefersReducedMotion ? 0.8 : scrollProgress;

    // Calculate dynamic 3D transformation parameters based on scroll:
    let depthFactor = 1; // 1 = full 3D volumetric extrusion, 0 = flat 2D silhouette
    let rotX = (28 * Math.PI) / 180;
    let rotY = (-38 * Math.PI) / 180;
    let rotZ = (5 * Math.PI) / 180;
    let faceShadingOpacity = 1;
    let sketchStrokeOpacity = 1;
    let blueprintMode = 0; // 0 = 3D metal / ink, 1 = precision blueprint blue

    if (p < 0.25) {
      // Stage 1: Full 3D Solid Model with subtle turntable inspection
      const tTurntable = p / 0.25;
      rotX = ((28 + Math.sin(tTurntable * Math.PI) * 3) * Math.PI) / 180;
      rotY = ((-38 + tTurntable * 14) * Math.PI) / 180;
      rotZ = (5 * Math.PI) / 180;
      depthFactor = 1;
      faceShadingOpacity = 1;
      sketchStrokeOpacity = 1;
      blueprintMode = 0;
    } else if (p >= 0.25 && p < 0.48) {
      // Stage 2: 3D Solid held with floating metrology cards visible
      const tHold = (p - 0.25) / (0.48 - 0.25);
      rotX = ((28 - tHold * 4) * Math.PI) / 180;
      rotY = ((-24 - tHold * 4) * Math.PI) / 180;
      rotZ = (5 * Math.PI) / 180;
      depthFactor = 1;
      faceShadingOpacity = 1;
      sketchStrokeOpacity = 1;
      blueprintMode = 0;
    } else if (p >= 0.48 && p < 0.72) {
      // Stage 3: Orthographic Projection & Flattening (3D -> 2D)
      const tProj = (p - 0.48) / (0.72 - 0.48); // 0 -> 1
      const ease = 0.5 - 0.5 * Math.cos(tProj * Math.PI); // Cosine ease-in-out
      
      // Rotate camera into true front orthographic alignment (angles smoothly return to 0)
      rotX = ((1 - ease) * 24 * Math.PI) / 180;
      rotY = ((1 - ease) * -28 * Math.PI) / 180;
      rotZ = ((1 - ease) * 5 * Math.PI) / 180;
      
      // Volumetric depth flattens into 2D plane
      depthFactor = Math.max(0, 1 - ease);
      faceShadingOpacity = Math.max(0, 1 - ease * 1.1);
      sketchStrokeOpacity = 1;
      blueprintMode = ease;
    } else if (p >= 0.72 && p < 0.88) {
      // Stage 4: Pure 2D Technical Sketch & ASME Y14.5 Blueprint Callouts
      rotX = 0;
      rotY = 0;
      rotZ = 0;
      depthFactor = 0;
      faceShadingOpacity = 0;
      sketchStrokeOpacity = 1;
      blueprintMode = 1;
    } else {
      // Stage 5: Settled 2D blueprint before footer
      rotX = 0;
      rotY = 0;
      rotZ = 0;
      depthFactor = 0;
      faceShadingOpacity = 0;
      sketchStrokeOpacity = 1;
      blueprintMode = 1;
    }

    // Dynamic scale and viewport center
    const scale = Math.min(width, height) * 0.0024;
    const centerX = width * (width < 1024 ? 0.5 : 0.48);
    const centerY = height * 0.52;

    // 3D Rotation & Projection Matrix
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

    const projected: ProjectedPoint[] = geometry.vertices.map((v) => {
      // Scale Z depth by depthFactor
      const x0 = v.x;
      const y0 = v.y;
      const z0 = v.z * depthFactor;

      // Rotate X
      const y1 = y0 * cosX - z0 * sinX;
      const z1 = y0 * sinX + z0 * cosX;

      // Rotate Y
      const x2 = x0 * cosY + z1 * sinY;
      const z2 = -x0 * sinY + z1 * cosY;

      // Rotate Z
      const x3 = x2 * cosZ - y1 * sinZ;
      const y3 = x2 * sinZ + y1 * cosZ;

      // Perspective projection
      const cameraDist = 800;
      const pers = cameraDist / (cameraDist + z2);

      return {
        x: centerX + x3 * scale * pers,
        y: centerY + y3 * scale * pers,
        z: z2,
        visible: true,
      };
    });

    // 1. Draw subtle contact shadow in 3D mode
    if (depthFactor > 0.05 && faceShadingOpacity > 0.1) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(
        centerX + 15 * depthFactor,
        centerY + 100 * scale,
        140 * scale,
        45 * scale * (0.4 + depthFactor * 0.6),
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(16, 20, 24, ${0.18 * faceShadingOpacity})`;
      ctx.filter = "blur(12px)";
      ctx.fill();
      ctx.restore();
    }

    // 2. Sort faces by Z-depth (Painter's Algorithm) for correct 3D occlusion
    const sortedFaces = [...geometry.faces].map((face) => {
      let avgZ = 0;
      for (const idx of face.indices) {
        avgZ += projected[idx]?.z || 0;
      }
      avgZ /= face.indices.length;
      return { face, avgZ };
    }).sort((a, b) => b.avgZ - a.avgZ);

    // 3. Render 3D Shaded Polygonal Faces (when emerging)
    if (faceShadingOpacity > 0.01) {
      for (const item of sortedFaces) {
        const face = item.face;
        if (face.wireframeOnly) continue;
        if (face.indices.length < 3) continue;

        ctx.beginPath();
        const first = projected[face.indices[0]];
        ctx.moveTo(first.x, first.y);
        for (let i = 1; i < face.indices.length; i++) {
          const pt = projected[face.indices[i]];
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();

        // Calculate face normal in 2D projection for lighting
        const p0 = projected[face.indices[0]];
        const p1 = projected[face.indices[1]];
        const p2 = projected[face.indices[2]];
        const vAx = p1.x - p0.x;
        const vAy = p1.y - p0.y;
        const vBx = p2.x - p0.x;
        const vBy = p2.y - p0.y;
        const crossZ = vAx * vBy - vAy * vBx;

        // Skip back-facing polygons in 3D mode
        if (depthFactor > 0.4 && crossZ < -10) continue;

        const [baseR, baseG, baseB] = face.color;
        // Blueprint tint blending
        const r = Math.round(baseR * (1 - blueprintMode * 0.7));
        const g = Math.round(baseG * (1 - blueprintMode * 0.4) + blueprintMode * 30);
        const b = Math.round(baseB * (1 - blueprintMode * 0.1) + blueprintMode * 70);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.85 * faceShadingOpacity})`;
        ctx.fill();

        // Subtle face border for crisp mechanical definition
        ctx.strokeStyle = `rgba(16, 20, 24, ${0.15 * faceShadingOpacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 4. Draw Engineering Wireframe Silhouette & Outlines
    const strokeLimit = geometry.edges.length;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i < strokeLimit; i++) {
      const [idxA, idxB] = geometry.edges[i];
      const ptA = projected[idxA];
      const ptB = projected[idxB];
      if (!ptA || !ptB) continue;

      ctx.beginPath();
      ctx.moveTo(ptA.x, ptA.y);
      ctx.lineTo(ptB.x, ptB.y);

      // Blueprint color vs Charcoal ink
      if (blueprintMode > 0.4) {
        ctx.strokeStyle = `rgba(18, 78, 173, ${0.85 * sketchStrokeOpacity})`; // Deep blueprint blue
        ctx.lineWidth = 1.8;
      } else {
        ctx.strokeStyle = `rgba(24, 30, 38, ${0.85 * sketchStrokeOpacity})`; // Crisp technical charcoal
        ctx.lineWidth = 1.5;
      }

      ctx.stroke();
    }
    ctx.restore();

    // 5. Draw Faint Technical Construction Rays & Centerlines (ASME Y14.5)
    // Emerge as 3D model flattens into 2D orthographic drawing
    if (blueprintMode > 0.05 || p > 0.45) {
      ctx.save();
      ctx.setLineDash([8, 4, 2, 4]); // Chain-dash centerline
      ctx.strokeStyle = blueprintMode > 0.3 ? "rgba(18, 78, 173, 0.45)" : "rgba(41, 41, 41, 0.22)";
      ctx.lineWidth = 1;

      // Vertical Centerline
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 160 * scale);
      ctx.lineTo(centerX, centerY + 140 * scale);
      ctx.stroke();

      // Horizontal Centerline
      ctx.beginPath();
      ctx.moveTo(centerX - 170 * scale, centerY);
      ctx.lineTo(centerX + 170 * scale, centerY);
      ctx.stroke();

      // Base Mounting Centerline
      ctx.beginPath();
      ctx.moveTo(centerX - 150 * scale, centerY + 60 * scale);
      ctx.lineTo(centerX + 150 * scale, centerY + 60 * scale);
      ctx.stroke();

      // 6. Highlight bottom flange edge in alert red when tolerance error is active in 2D mode
      if (blueprintMode > 0.6 && errorProgress > 0.1) {
        ctx.save();
        ctx.strokeStyle = `rgba(217, 45, 32, ${errorProgress * 0.95})`;
        ctx.lineWidth = 2.4;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(centerX - 110 * scale, centerY + 75 * scale);
        ctx.lineTo(centerX + 110 * scale, centerY + 75 * scale);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }, [scrollProgress, dimensions, geometry, prefersReducedMotion, errorProgress]);

  // Determine current active phase for UI indicators (3D -> 2D workflow)
  const currentPhaseIndex = useMemo(() => {
    if (scrollProgress < 0.25) return 0; // Phase 01: 3D CAD Solid
    if (scrollProgress < 0.48) return 1; // Phase 02: Feature Metrology
    if (scrollProgress < 0.72) return 2; // Phase 03: Orthographic Projection
    if (scrollProgress < 0.83) return 3; // Phase 04: 2D Blueprint Sketch
    return 4; // Phase 05: Dimension Tolerance Error Detection
  }, [scrollProgress]);

  // Floating Cards Parallax & Opacity Calculations:
  // Fade in at 0.10 and frame the canvas perimeter
  const cardsOpacity = useMemo(() => {
    if (scrollProgress < 0.10) return scrollProgress / 0.10;
    return 1;
  }, [scrollProgress]);

  // Subtle parallax drift during 3D phases, settling firmly into corner docking for 2D mode
  const cardsDriftY = useMemo(() => {
    if (scrollProgress >= 0.70) return 0;
    return (scrollProgress - 0.5) * 35;
  }, [scrollProgress]);

  // Blueprint Dimension Annotations Visibility:
  // Draw progressively between 0.70 and 0.88 as 2D sketch establishes
  const blueprintDrawProgress = useMemo(() => {
    if (scrollProgress < 0.70) return 0;
    if (scrollProgress > 0.88) return 1;
    return (scrollProgress - 0.70) / (0.88 - 0.70);
  }, [scrollProgress]);

  return (
    <section
      ref={containerRef}
      id="architect-mode-experience"
      className="relative w-full h-[320vh] lg:h-[380vh] bg-[#f4ebd7] border-t-2 border-[#101418]"
    >
      {/* PINNED VIEWPORT: 100vh Sticky Canvas & Content */}
      <div className="sticky top-0 w-full h-[100dvh] overflow-hidden flex flex-col justify-between select-none">
        
        {/* =================================================================== */}
        {/* TOP TECHNICAL DRAWING HEADER / SHEET FRAME METADATA                 */}
        {/* =================================================================== */}
        <div className="relative w-full z-30 flex items-center justify-between pt-16 sm:pt-20 lg:pt-22 pb-2 px-4 sm:px-8 md:px-12 text-[10px] sm:text-xs font-mono text-[#5c6470] tracking-wider pointer-events-none">
          <div className="flex items-center gap-2 sm:gap-3 bg-[#FFFBF0]/90 px-2.5 py-1 rounded-[3px] border border-[#101418]/20 shadow-[1px_1px_0_#101418]/15 backdrop-blur-[2px]">
            <span className="font-bold text-[#124ead]">SHT. M-01 // ARCHITECT MODE</span>
            <span className="hidden md:inline-block text-[#101418]/30">//</span>
            <span className="hidden md:inline-block uppercase text-[#101418]">
              3D CAD TO 2D BLUEPRINT SYNTHESIS &amp; ASME METROLOGY
            </span>
          </div>

          {/* Transformation Stage Pill Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#FFFBF0]/90 px-2.5 py-1 rounded-[3px] border border-[#101418]/20 shadow-[1px_1px_0_#101418]/15 backdrop-blur-[2px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
            <span className="font-mono font-bold text-[#101418]">
              {currentPhaseIndex === 0 && "PHASE 01: 3D CAD SOLID"}
              {currentPhaseIndex === 1 && "PHASE 02: FEATURE METROLOGY"}
              {currentPhaseIndex === 2 && "PHASE 03: ORTHOGRAPHIC PROJECTION"}
              {currentPhaseIndex >= 3 && "PHASE 04: 2D BLUEPRINT SKETCH"}
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* MAIN SPLIT VIEW: 60-65% VISUAL (LEFT) + 35-40% CONTENT (RIGHT)     */}
        {/* =================================================================== */}
        <div className="relative w-full flex-1 flex flex-col lg:flex-row items-center justify-between px-3 sm:px-6 md:px-10 z-20 overflow-hidden my-auto">
          
          {/* ----------------------------------------------------------------- */}
          {/* LEFT: 60-65% VISUAL ARENA (3D Canvas + Dimension SVG + Cards)     */}
          {/* ----------------------------------------------------------------- */}
          <div className="relative w-full lg:w-[62%] xl:w-[65%] h-[52vh] sm:h-[60vh] lg:h-[76vh] flex items-center justify-center">
            
            {/* Draft Paper Background Card with Blueprint Grid */}
            <div className="absolute inset-2 sm:inset-4 rounded-xl border-2 border-[#101418] bg-[#F6EFDB] bg-drafting-grid shadow-[6px_6px_0_#101418] overflow-hidden flex items-center justify-center">
              
              {/* Corner Registration Crosshairs (+) */}
              <span className="absolute top-3 left-3 font-mono text-[10px] text-[#101418]/40 select-none">
                + (0,0)
              </span>
              <span className="absolute top-3 right-3 font-mono text-[10px] text-[#101418]/40 select-none">
                + (W,0)
              </span>
              <span className="absolute bottom-3 left-3 font-mono text-[10px] text-[#101418]/40 select-none">
                + (0,H)
              </span>
              <span className="absolute bottom-3 right-3 font-mono text-[10px] text-[#101418]/40 select-none">
                DATUM [-A-]
              </span>

              {/* 3D Geometry Canvas */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* ------------------------------------------------------------- */}
              {/* OVERLAY SVG: ASME Y14.5 DIMENSION ANNOTATIONS (STAGE D)      */}
              {/* ------------------------------------------------------------- */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: blueprintDrawProgress,
                }}
              >
                <defs>
                  <marker
                    id="blueprint-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0.5, 6 3, 0 5.5" fill="#124ead" />
                  </marker>
                  <marker
                    id="blueprint-arrow-reverse"
                    markerWidth="8"
                    markerHeight="8"
                    refX="0"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="6 0.5, 0 3, 6 5.5" fill="#124ead" />
                  </marker>
                  {/* Alert Error Markers */}
                  <marker
                    id="blueprint-arrow-error"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0.5, 6 3, 0 5.5" fill="#D92D20" />
                  </marker>
                  <marker
                    id="blueprint-arrow-error-reverse"
                    markerWidth="8"
                    markerHeight="8"
                    refX="0"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="6 0.5, 0 3, 6 5.5" fill="#D92D20" />
                  </marker>
                </defs>

                {/* Overall Width Dimension Bar: Nominal 148.00 ± 0.05 mm -> Flags 148.18 mm Tolerance Error */}
                <g className="font-mono text-[11px] font-bold transition-all duration-300">
                  {/* Extension lines */}
                  <line
                    x1="28%"
                    y1="78%"
                    x2="28%"
                    y2="88%"
                    stroke={errorProgress > 0.3 ? "#D92D20" : "#124ead"}
                    strokeWidth={errorProgress > 0.3 ? "1.4" : "1"}
                    strokeDasharray={errorProgress > 0.3 ? "none" : "3 3"}
                  />
                  <line
                    x1="68%"
                    y1="78%"
                    x2="68%"
                    y2="88%"
                    stroke={errorProgress > 0.3 ? "#D92D20" : "#124ead"}
                    strokeWidth={errorProgress > 0.3 ? "1.4" : "1"}
                    strokeDasharray={errorProgress > 0.3 ? "none" : "3 3"}
                  />
                  {/* Dimension line with arrows */}
                  <line
                    x1="28%"
                    y1="85%"
                    x2="68%"
                    y2="85%"
                    stroke={errorProgress > 0.3 ? "#D92D20" : "#124ead"}
                    strokeWidth={errorProgress > 0.3 ? "1.8" : "1.4"}
                    markerStart={errorProgress > 0.3 ? "url(#blueprint-arrow-error-reverse)" : "url(#blueprint-arrow-reverse)"}
                    markerEnd={errorProgress > 0.3 ? "url(#blueprint-arrow-error)" : "url(#blueprint-arrow)"}
                  />

                  {/* Dimension Measurement Label / Error Annotation Box */}
                  {errorProgress > 0.3 ? (
                    /* Metrology Dimension Error Annotation: 148.18 mm | +0.13 mm centered directly above line */
                    <svg x="48%" y="85%" overflow="visible" className="transition-all duration-300">
                      {/* Pale cream rounded rectangular box sitting entirely above the dimension line */}
                      <rect
                        x="-69"
                        y="-28"
                        width="138"
                        height="22"
                        fill="#FFFBF0"
                        stroke="#D92D20"
                        strokeWidth="1.2"
                        rx="3"
                      />
                      {/* Subtle vertical divider between measurement and deviation */}
                      <line
                        x1="4"
                        y1="-22"
                        x2="4"
                        y2="-12"
                        stroke="#D92D20"
                        strokeWidth="1"
                        strokeOpacity="0.35"
                      />
                      {/* Measured value: 148.18 mm (prominent bold deep red) */}
                      <text
                        x="-2"
                        y="-17"
                        textAnchor="end"
                        dominantBaseline="central"
                        fill="#B42318"
                        fontSize="10.5"
                        fontWeight="700"
                        className="font-mono tracking-tight"
                      >
                        148.18 mm
                      </text>
                      {/* Deviation value: +0.13 mm (semi-bold alert red) */}
                      <text
                        x="10"
                        y="-17"
                        textAnchor="start"
                        dominantBaseline="central"
                        fill="#D92D20"
                        fontSize="10"
                        fontWeight="600"
                        className="font-mono tracking-tight"
                      >
                        +0.13 mm
                      </text>
                    </svg>
                  ) : (
                    /* Nominal Dimension Badge: 148.00 ± 0.05 mm centered directly above line */
                    <svg x="48%" y="85%" overflow="visible" className="transition-all duration-300">
                      <rect
                        x="-54"
                        y="-26"
                        width="108"
                        height="20"
                        fill="#F6EFDB"
                        stroke="#124ead"
                        strokeWidth="1"
                        rx="2.5"
                      />
                      <text
                        x="0"
                        y="-16"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#124ead"
                        fontSize="10"
                        fontWeight="700"
                        className="font-mono"
                      >
                        148.00 ± 0.05 mm
                      </text>
                    </svg>
                  )}
                </g>

                {/* Spindle Bore Leader Dimension: Ø48.00 H7 */}
                <g className="font-mono text-[10px] text-[#124ead] font-bold">
                  <polyline
                    points="48%,40% 41%,30% 32%,30%"
                    fill="none"
                    stroke="#124ead"
                    strokeWidth="1.4"
                    markerStart="url(#blueprint-arrow-reverse)"
                  />
                  <rect x="22%" y="24%" width="88" height="18" fill="#F6EFDB" rx="2" />
                  <text x="32%" y="28%" textAnchor="end" fill="#124ead">
                    Ø48.00 H7 ↧ 35.0 mm
                  </text>
                </g>

                {/* GD&T Feature Control Frame: [ ⌖ | Ø0.02 | A | B ] */}
                <g className="font-mono text-[9px]">
                  <polyline points="48%,52% 36%,52% 26%,52%" fill="none" stroke="#124ead" strokeWidth="1.4" />
                  <svg x="26%" y="52%" overflow="visible">
                    <rect
                      x="-106"
                      y="-10"
                      width="106"
                      height="20"
                      fill="#FFFBF0"
                      stroke="#124ead"
                      strokeWidth="1.2"
                      rx="2"
                    />
                    <text
                      x="-53"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#124ead"
                      fontWeight="bold"
                      fontSize="9"
                      className="font-mono tracking-tight"
                    >
                      ⌖ | Ø0.02 | A | B
                    </text>
                  </svg>
                </g>

                {/* Leader Line from Metrology Error Card to Out-of-Spec Dimension */}
                {errorProgress > 0.3 && (
                  <g className="transition-opacity duration-300">
                    <circle cx="21%" cy="80%" r="2" fill="#D92D20" />
                    <polyline
                      points="21%,80% 26%,80% 33.5%,85%"
                      fill="none"
                      stroke="#D92D20"
                      strokeWidth="1.6"
                      markerEnd="url(#blueprint-arrow-error)"
                    />
                  </g>
                )}

                {/* Overall Height Dimension: 92.00 mm */}
                <g className="font-mono text-[10px] text-[#124ead] font-bold hidden sm:block">
                  <line x1="72%" y1="28%" x2="80%" y2="28%" stroke="#124ead" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="72%" y1="76%" x2="80%" y2="76%" stroke="#124ead" strokeWidth="1" strokeDasharray="3 3" />
                  <line
                    x1="78%"
                    y1="28%"
                    x2="78%"
                    y2="76%"
                    stroke="#124ead"
                    strokeWidth="1.4"
                    markerStart="url(#blueprint-arrow-reverse)"
                    markerEnd="url(#blueprint-arrow)"
                  />
                  <rect x="74%" y="50%" width="58" height="18" fill="#F6EFDB" rx="2" />
                  <text x="77%" y="53%" textAnchor="middle" fill="#124ead" dominantBaseline="middle">
                    92.00 mm
                  </text>
                </g>
              </svg>

              {/* ------------------------------------------------------------- */}
              {/* FLOATING ENGINEERING INFORMATION CARDS (PERIMETER HUD BLOCKS) */}
              {/* ------------------------------------------------------------- */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-300"
                style={{
                  opacity: cardsOpacity,
                  transform: `translateY(${cardsDriftY}px)`,
                }}
              >
                {/* Card 1: Drawing Metadata (Top-Left) */}
                <div className="absolute top-5 left-5 max-w-[210px] bg-[#FFFBF0] border-[1.5px] border-[#101418] rounded-[4px] p-2 sm:p-2.5 shadow-[3px_3px_0_#101418] pointer-events-auto hover:translate-x-0.5 transition-transform hidden sm:block">
                  <div className="flex items-center justify-between border-b border-[#101418]/20 pb-1 mb-1 font-mono text-[9px] text-[#101418]/60">
                    <span>CAD SOLID // B-REP</span>
                    <span className="font-bold text-[#124ead]">REV. C</span>
                  </div>
                  <div className="font-mono text-[10px] font-bold text-[#101418] leading-tight">
                    ASME Y14.3 MULTI-VIEW
                  </div>
                  <div className="text-[9.5px] text-[#5c6470] mt-0.5">
                    Orthographic projection extraction active
                  </div>
                </div>

                {/* Card 2: Spindle Bore Metrology -> Metrology Error (Bottom-Left) */}
                <div
                  className={`absolute bottom-6 left-5 max-w-[215px] sm:max-w-[230px] bg-[#FFFBF0] rounded-[4px] p-2 sm:p-2.5 pointer-events-auto hover:translate-x-0.5 transition-all duration-300 ${
                    errorProgress > 0.3
                      ? "border-[1.5px] border-[#D92D20] shadow-[3px_3px_0_#D92D20]"
                      : "border-[1.5px] border-[#101418] shadow-[3px_3px_0_#101418]"
                  }`}
                >
                  {errorProgress > 0.3 ? (
                    <div>
                      <div className="flex items-center justify-between border-b border-[#D92D20]/25 pb-1 mb-1 font-mono text-[9px]">
                        <span className="font-bold text-[#D92D20] flex items-center gap-1.5 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20] animate-ping shrink-0" />
                          METROLOGY ERROR
                        </span>
                        <span className="bg-[#FEE4E2] text-[#D92D20] font-bold px-1.5 py-0.5 rounded border border-[#D92D20]/40 text-[8.5px]">
                          FAIL +0.13
                        </span>
                      </div>
                      <div className="font-mono text-[11px] sm:text-xs font-bold text-[#D92D20]">
                        148.18 mm{" "}
                        <span className="text-[#5c6470] font-normal text-[9.5px]">
                          (SPEC ±0.05)
                        </span>
                      </div>
                      <div className="font-mono text-[9px] text-[#5c6470] mt-0.5 leading-tight">
                        DIM #01 Flange Width exceeds ASME tolerance limit
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-mono text-[9px] font-bold text-[#ff5500] uppercase tracking-wider">
                        CRITICAL METROLOGY
                      </div>
                      <div className="font-mono text-[11px] sm:text-xs font-bold text-[#101418]">
                        Ø48.000 +0.012/-0.000
                      </div>
                      <div className="font-mono text-[9px] text-[#5c6470] mt-0.5">
                        Cylindricity 0.004 mm // Runout ↗ 0.002
                      </div>
                    </div>
                  )}
                </div>

                {/* Card 3: Material & Surface Spec (Top-Right) */}
                <div className="absolute top-5 right-5 max-w-[220px] bg-[#FFFBF0] border-[1.5px] border-[#101418] rounded-[4px] p-2 sm:p-2.5 shadow-[3px_3px_0_#101418] pointer-events-auto hover:translate-x-0.5 transition-transform hidden md:block">
                  <div className="font-mono text-[9px] font-bold text-[#124ead] uppercase tracking-wider">
                    RAW MATERIAL // FINISH
                  </div>
                  <div className="font-mono text-[11px] font-bold text-[#101418]">
                    AL 7075-T651 BILLET
                  </div>
                  <div className="text-[9px] font-mono text-[#5c6470] mt-0.5">
                    Hard Anodize MIL-A-8625 Type III
                  </div>
                </div>

                {/* Card 4: 5-Axis Machine Tooling (Bottom-Right) */}
                <div className="absolute bottom-6 right-5 max-w-[210px] bg-[#FFFBF0] border-[1.5px] border-[#101418] rounded-[4px] p-2 sm:p-2.5 shadow-[3px_3px_0_#101418] pointer-events-auto hover:translate-x-0.5 transition-transform hidden sm:block">
                  <div className="font-mono text-[9px] font-bold text-[#16A34A] uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    SPINDLE ROUTING
                  </div>
                  <div className="font-mono text-[10.5px] font-bold text-[#101418]">
                    5-AXIS CNC DISPATCH
                  </div>
                  <div className="text-[9px] font-mono text-[#5c6470] mt-0.5">
                    Toolpath: 14,200 RPM // Flood Coolant
                  </div>
                </div>

                {/* Card 5: Autonomous DFM Verification (Center-Right) */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 right-4 max-w-[190px] bg-[#FFFBF0] border-[1.5px] border-[#101418] rounded-[4px] p-2 shadow-[3px_3px_0_#101418] pointer-events-auto hover:translate-x-0.5 transition-all duration-300 hidden lg:block ${
                    blueprintDrawProgress > 0.3 ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                >
                  <div className="font-mono text-[9px] font-bold text-[#101418] uppercase">
                    DFM SYNTHESIS
                  </div>
                  <div className="text-[10px] font-bold text-[#124ead] mt-0.5">
                    12 OF 12 CHECKS PASS
                  </div>
                  <div className="text-[8.5px] text-[#5c6470] font-mono mt-0.5">
                    Zero tool collision non-conformities
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* RIGHT: 35-40% EDITORIAL CONTENT & CTA BUTTON                      */}
          {/* ----------------------------------------------------------------- */}
          <div className="relative w-full lg:w-[36%] xl:w-[33%] flex flex-col justify-center px-2 sm:px-4 lg:pl-6 py-4 lg:py-0 z-30">
            
            {/* Eyebrow with Sketch Scribble Accent */}
            <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-2 h-2 bg-[#ff5500] rounded-[1px] rotate-45 inline-block" />
              <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-[#ff5500] uppercase">
                3D TO 2D AUTODRAFTING
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-[2.8rem] xl:text-[3.2rem] font-bold tracking-tight text-[#101418] leading-[1.05] mb-3 sm:mb-4">
              Explore Architect Mode
            </h2>

            {/* Description Copy */}
            <p className="text-sm sm:text-base text-[#424a56] leading-relaxed mb-5 sm:mb-6 max-w-md font-normal">
              Transform complex 3D CAD models into intelligent 2D engineering drawings. Extract orthographic views, arrange equipment, and synthesize every dimension before production begins.
            </p>

            {/* Transformation Step Matrix */}
            <div className="grid grid-cols-2 gap-2 mb-6 sm:mb-7 max-w-md font-mono text-[11px]">
              <div
                className={`p-2 rounded-[3px] border transition-all ${
                  currentPhaseIndex === 0
                    ? "bg-[#FFFBF0] border-[#ff5500] shadow-[2px_2px_0_#ff5500] text-[#101418] font-bold"
                    : "bg-[#FFFBF0]/60 border-[#101418]/15 text-[#5c6470]"
                }`}
              >
                <span className="text-[#ff5500] mr-1">01</span> 3D CAD Solid
              </div>
              <div
                className={`p-2 rounded-[3px] border transition-all ${
                  currentPhaseIndex === 1
                    ? "bg-[#FFFBF0] border-[#ff5500] shadow-[2px_2px_0_#ff5500] text-[#101418] font-bold"
                    : "bg-[#FFFBF0]/60 border-[#101418]/15 text-[#5c6470]"
                }`}
              >
                <span className="text-[#ff5500] mr-1">02</span> Feature Metrology
              </div>
              <div
                className={`p-2 rounded-[3px] border transition-all ${
                  currentPhaseIndex === 2
                    ? "bg-[#FFFBF0] border-[#ff5500] shadow-[2px_2px_0_#ff5500] text-[#101418] font-bold"
                    : "bg-[#FFFBF0]/60 border-[#101418]/15 text-[#5c6470]"
                }`}
              >
                <span className="text-[#ff5500] mr-1">03</span> Orthographic Projection
              </div>
              <div
                className={`p-2 rounded-[3px] border transition-all ${
                  currentPhaseIndex >= 3
                    ? "bg-[#FFFBF0] border-[#124ead] shadow-[2px_2px_0_#124ead] text-[#124ead] font-bold"
                    : "bg-[#FFFBF0]/60 border-[#101418]/15 text-[#5c6470]"
                }`}
              >
                <span className="text-[#124ead] mr-1">04</span> 2D Blueprint Sketch
              </div>
            </div>

            {/* Primary Action Button & Annotation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                href="/architect"
                className="group inline-flex items-center gap-2.5 bg-[#ff5500] hover:bg-[#e04a00] text-white font-bold text-sm sm:text-base py-3 px-6 rounded-[4px] border-2 border-[#101418] shadow-[4px_4px_0_#101418] hover:shadow-[5px_5px_0_#101418] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Explore Architect Mode</span>
                <span className="text-white text-base group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>

              {/* Supporting Annotation */}
              <span className="font-handwriting text-sm sm:text-base text-[#424a56] font-bold tracking-wide select-none pt-1">
                ↳ move from 3D to 2D sketch
              </span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BOTTOM METADATA BAR / TRANSITION HINT                               */}
        {/* =================================================================== */}
        <div className="relative w-full z-30 flex items-center justify-between pb-3 sm:pb-4 px-4 sm:px-8 md:px-12 text-[10px] sm:text-xs font-mono text-[#5c6470] tracking-wider pointer-events-none border-t border-[#101418]/15">
          <div className="flex items-center gap-2 pt-1">
            <span className="font-bold text-[#101418]">SCROLL TO DRAFT 2D SKETCH</span>
            <span className="text-[#101418]/30">|</span>
            <span>REVERSIBLE 3D → 2D PROJECTION</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span>PROGRESS:</span>
            <span className="font-bold text-[#ff5500]">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArchitectModeExperience;

