"use client";

import React, { useState, useEffect, useRef } from "react";
import { PIPELINE_STAGES } from "../mockData";
import { Stepper } from "./Stepper";
import { PartSummary } from "./PartSummary";
import { ViewGrid } from "./ViewGrid";
import { OrientationView } from "./OrientationView";
import { FeatureTreeTable } from "./FeatureTreeTable";
import { ViewSelectionTable } from "./ViewSelectionTable";
import { DerivedViews } from "./DerivedViews";
import { DimensionTable } from "./DimensionTable";
import { DrawingSheet } from "./DrawingSheet";
import { AgentsFeed } from "./AgentsFeed";
import { getDrawingVariant } from "../drawingVariants";
import { ActiveRunState, generateRandomStageDurations, formatRunTimer } from "../runState";

interface RunViewProps {
  runId?: string;
  fileName?: string;
  onCancel: () => void;
  isInspect?: boolean;
  runState?: ActiveRunState | null;
  onUpdateRunState?: React.Dispatch<React.SetStateAction<ActiveRunState | null>>;
  onRunComplete?: (info: {
    runId?: string;
    fileName: string;
    moduleName: "AUTODRAFT";
    moduleCode: "01-autodraft";
    runTitle: string;
    result: string;
    resultType: "error" | "warn" | "clear" | "neutral";
    details?: Record<string, unknown>;
  }) => void;
}

export function RunView({
  runId,
  fileName = "clevis.step",
  onCancel,
  isInspect = false,
  runState,
  onUpdateRunState,
  onRunComplete,
}: RunViewProps) {
  // Fallback state if runState was not provided by parent
  const [localFallbackState, setLocalFallbackState] = useState<ActiveRunState>(() => {
    const now = Date.now();
    const stageDurationsMs = generateRandomStageDurations();
    const totalDurationMs = stageDurationsMs.reduce((a, b) => a + b, 0);
    return {
      runId: runId || `run-${now}`,
      currentStage: isInspect ? 7 : 0,
      startedAt: isInspect ? now - totalDurationMs : now,
      stageStartedAt: isInspect ? now - (stageDurationsMs[7] || 1800) : now,
      status: isInspect ? "done" : "running",
      stageDurationsMs,
    };
  });

  const effectiveRunState: ActiveRunState = runState || localFallbackState;

  const updateRunState = (fn: (prev: ActiveRunState) => ActiveRunState | null) => {
    if (onUpdateRunState) {
      onUpdateRunState((prev) => (prev ? fn(prev) : null));
    } else {
      setLocalFallbackState((prev) => fn(prev) ?? prev);
    }
  };

  // Single ticker timestamp for live counting-up duration displays
  const [tickNow, setTickNow] = useState<number>(Date.now());
  const [inspectedStageOverride, setInspectedStageOverride] = useState<number | null>(null);
  const hasNotifiedComplete = useRef(isInspect);

  // STAGE TIMING: Each stage lasts a randomized duration between 1.5s and 2.0s
  // One interval driven off stageStartedAt advances the stage and ticks live time.
  useEffect(() => {
    if (isInspect || effectiveRunState.status !== "running") return;

    const interval = setInterval(() => {
      const now = Date.now();
      const stageElapsed = now - effectiveRunState.stageStartedAt;
      const currentTargetMs =
        effectiveRunState.stageDurationsMs?.[effectiveRunState.currentStage] ?? 1800;

      if (stageElapsed >= currentTargetMs) {
        if (effectiveRunState.currentStage < 7) {
          // Advance to next stage: n = currentStage + 1
          updateRunState((prev) => {
            if (prev.status !== "running") return prev;
            return {
              ...prev,
              currentStage: prev.currentStage + 1,
              stageStartedAt: now,
            };
          });
        } else {
          // All 8 stages finished!
          updateRunState((prev) => {
            if (prev.status !== "running") return prev;
            return {
              ...prev,
              status: "done",
            };
          });
        }
      } else {
        setTickNow(now);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [
    effectiveRunState.status,
    effectiveRunState.currentStage,
    effectiveRunState.stageStartedAt,
    effectiveRunState.stageDurationsMs,
    isInspect,
  ]);

  const isFinished = effectiveRunState.status === "done" || isInspect;
  const isCancelled = effectiveRunState.status === "cancelled";

  // Current active stage number n (1 to 8)
  const currentStageNumber = Math.min(8, effectiveRunState.currentStage + 1);

  // Inspected stage: defaults to current active stage during run, 8 on finish
  const inspectedStage = inspectedStageOverride ?? (isFinished ? 8 : currentStageNumber);

  const currentStageTargetMs =
    effectiveRunState.stageDurationsMs?.[effectiveRunState.currentStage] ?? 1800;

  // Live elapsed calculation for active stepper step and whole run header
  const liveStageElapsedSeconds =
    effectiveRunState.status === "running"
      ? Math.min(
          currentStageTargetMs / 1000,
          Math.max(0, (tickNow - effectiveRunState.stageStartedAt) / 1000)
        )
      : currentStageTargetMs / 1000;

  const totalRunDurationMs =
    effectiveRunState.stageDurationsMs?.reduce((a, b) => a + b, 0) ?? 14400;

  const totalElapsedSeconds = Math.max(
    0,
    Math.floor(
      ((effectiveRunState.status === "running"
        ? tickNow
        : effectiveRunState.status === "done"
        ? effectiveRunState.startedAt + totalRunDurationMs
        : tickNow) -
        effectiveRunState.startedAt) /
        1000
    )
  );

  // Notify completion and persist to project when stage 8 finishes
  useEffect(() => {
    if (isFinished && !hasNotifiedComplete.current && !isInspect) {
      hasNotifiedComplete.current = true;
      const variant = getDrawingVariant(fileName);
      onRunComplete?.({
        runId: effectiveRunState.runId,
        fileName,
        moduleName: "AUTODRAFT",
        moduleCode: "01-autodraft",
        runTitle: `STEP to drawing · ${fileName}`,
        result: `${variant.issues.length} LAYOUT ISSUES`,
        resultType: "warn",
      });
    }
  }, [isFinished, effectiveRunState.runId, fileName, isInspect, onRunComplete]);

  const handleStageSelect = (stageId: number) => {
    if (stageId <= currentStageNumber || isFinished) {
      setInspectedStageOverride(stageId);
    }
  };

  const handleCancelClick = () => {
    if (effectiveRunState.status === "running") {
      // Clear timer, freeze state, mark as cancelled in sidebar
      updateRunState((prev) => ({ ...prev, status: "cancelled" }));
    } else {
      onCancel();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FFFBF0]">
      {/* Run Header */}
      <div className="px-5 py-3 border-b-[1.5px] border-[#101418] flex items-center justify-between bg-[#FFFBF0] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#101418]">
              <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-[#101418] font-mono tracking-tight">
              Run {fileName}
            </h1>
          </div>

          {/* Status Pill: Single source of truth synchronized with activeRunState */}
          {isFinished ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#1E43D8] text-white border-[1.5px] border-[#101418] shadow-2xs">
              <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Finished (8/8 stages)
            </span>
          ) : isCancelled ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FF6B2C] text-white border-[1.5px] border-[#101418] shadow-2xs">
              <span>⚠</span>
              Cancelled at Stage {currentStageNumber}/8
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FFC53D] text-[#101418] border-[1.5px] border-[#101418] shadow-2xs">
              <span className="w-2 h-2 rounded-full border-[2px] border-[#101418] border-t-transparent animate-spin" />
              Running Stage {currentStageNumber}/8 ({formatRunTimer(totalElapsedSeconds)})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Cancel run: freezes state and stops timer cleanly */}
          <button
            onClick={handleCancelClick}
            className="btn-ivory text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer text-[#101418]"
          >
            {effectiveRunState.status === "running" ? "Cancel run" : "Back to upload"}
          </button>
        </div>
      </div>

      {/* Stepper Bar */}
      <Stepper
        currentStageId={currentStageNumber}
        activeStageId={inspectedStage}
        onSelectStage={handleStageSelect}
        isRunning={effectiveRunState.status === "running"}
        liveElapsedSeconds={liveStageElapsedSeconds}
        stageDurationsMs={effectiveRunState.stageDurationsMs}
      />

      {/* Main Workspace + Right Agents Feed */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center Stage Workspace with drafting paper grid background */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F6EFDB] bg-drafting-grid">
          <div className="w-full max-w-7xl mx-auto space-y-5">
            {/* Stage Inspection Bar */}
            {inspectedStage !== currentStageNumber && (
              <div className="bg-[#FFC53D]/30 border-[1.5px] border-[#101418] rounded-lg px-3.5 py-2 text-xs font-mono flex items-center justify-between text-[#101418] shadow-hard-xs">
                <span>
                  Inspecting Stage {inspectedStage}: <strong>{PIPELINE_STAGES.find((s) => s.id === inspectedStage)?.name}</strong>
                </span>
                <button
                  onClick={() => setInspectedStageOverride(null)}
                  className="font-bold underline hover:text-[#1E43D8] cursor-pointer ml-2"
                >
                  Return to active ({currentStageNumber})
                </button>
              </div>
            )}

            {/* Active Stage Card Switching */}
            {inspectedStage === 1 && <PartSummary />}
            {inspectedStage === 2 && <ViewGrid />}
            {inspectedStage === 3 && (
              <OrientationView isPending={currentStageNumber === 3 && effectiveRunState.status === "running"} />
            )}
            {inspectedStage === 4 && <FeatureTreeTable />}
            {inspectedStage === 5 && <ViewSelectionTable />}
            {inspectedStage === 6 && <DerivedViews />}
            {inspectedStage === 7 && <DimensionTable />}
            {inspectedStage === 8 && (
              isFinished ? (
                <DrawingSheet fileName={fileName} />
              ) : (
                <Stage8GeneratingView fileName={fileName} />
              )
            )}
          </div>
        </div>

        {/* Right: Agents Streaming Log with sync confirmation lines */}
        <AgentsFeed
          currentStageId={currentStageNumber}
          isRunning={effectiveRunState.status === "running"}
          liveElapsedSeconds={liveStageElapsedSeconds}
          stageDurationsMs={effectiveRunState.stageDurationsMs}
        />
      </div>
    </div>
  );
}

function Stage8GeneratingView({ fileName }: { fileName: string }) {
  return (
    <div className="w-full bg-white rounded-xl border-2 border-[#101418] p-8 shadow-hard-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[360px]">
      <div className="w-12 h-12 rounded-full bg-[#E8EEFC] border-2 border-[#101418] text-[#1E43D8] flex items-center justify-center shadow-2xs animate-pulse">
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <div>
        <h3 className="font-display font-bold text-lg text-[#101418]">
          Compiling Production Drawing Sheet
        </h3>
        <p className="font-mono text-xs text-[#101418]/60 mt-1 max-w-md">
          Resolving ASME Y14.100 spatial constraints, projection alignments, and layout advisories for {fileName}...
        </p>
      </div>
      <div className="w-56 h-2 bg-[#F0E8D4] border border-[#101418] rounded-full overflow-hidden">
        <div className="h-full bg-[#1E43D8] animate-pulse" style={{ width: "95%" }} />
      </div>
    </div>
  );
}
