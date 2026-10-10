export interface ActiveRunState {
  runId: string;
  currentStage: number; // 0–7 index (0 for stage 1, 7 for stage 8)
  startedAt: number; // Date.now() timestamp ms
  stageStartedAt: number; // Date.now() timestamp ms
  status: "running" | "done" | "cancelled";
  stageDurationsMs?: number[]; // Target duration ms for each of the 8 stages (random 1500–2000ms)
}

export const STAGE_DURATION_MS = 2000;
export const TOTAL_STAGES = 8;

/**
 * Generates an 8-element array of random durations between 1.5s and 2.0s (1500ms - 2000ms).
 * e.g. [1620, 1840, 1530, 1970, 1750, 1590, 1880, 1690]
 */
export function generateRandomStageDurations(): number[] {
  return Array.from({ length: TOTAL_STAGES }, () => Math.round(1500 + Math.random() * 500));
}

/**
 * Formats elapsed seconds to m:ss (e.g. 0:02, 1:15)
 */
export function formatRunTimer(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.floor(Math.max(0, totalSeconds)) % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/**
 * Formats timestamp to sidebar row date format (e.g. Oct 11, 12:05 AM)
 */
export function formatSidebarTimestamp(timestampMs: number): string {
  const d = new Date(timestampMs);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

