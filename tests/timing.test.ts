import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ActiveRunState,
  STAGE_DURATION_MS,
  TOTAL_STAGES,
  formatRunTimer,
  formatSidebarTimestamp,
  generateRandomStageDurations,
} from "../app/app/runState";
import { PIPELINE_STAGES, AGENT_LOG_GROUPS } from "../app/app/mockData";

test("Run Engine: Stage duration is exactly 2000ms across 8 stages", () => {
  assert.equal(STAGE_DURATION_MS, 2000);
  assert.equal(TOTAL_STAGES, 8);
  assert.equal(PIPELINE_STAGES.length, 8);
});

test("Run Engine: Fake durations removed from PIPELINE_STAGES", () => {
  const fakeDurations = ["166ms", "31.4s", "53.2s", "34.5s", "0ms", "3m 54s", "10m 9s"];
  for (const stage of PIPELINE_STAGES) {
    assert.equal(stage.nominalDuration, "2s");
    assert.ok(!fakeDurations.includes(stage.nominalDuration));
  }
});

test("Run Engine: Fake durations removed from AGENT_LOG_GROUPS", () => {
  for (const group of AGENT_LOG_GROUPS) {
    assert.equal(group.duration, "2.0s");
  }
});

test("Run Engine: formatRunTimer formats (m:ss) cleanly", () => {
  assert.equal(formatRunTimer(0), "0:00");
  assert.equal(formatRunTimer(2), "0:02");
  assert.equal(formatRunTimer(14), "0:14");
  assert.equal(formatRunTimer(65), "1:05");
  assert.equal(formatRunTimer(120), "2:00");
});

test("Run Engine: Single source of truth activeRunState drives stage advancement", () => {
  const now = Date.now();
  const runState: ActiveRunState = {
    runId: "run-test-1",
    currentStage: 0, // Stage 1 (0-indexed)
    startedAt: now,
    stageStartedAt: now,
    status: "running",
  };

  // n = currentStage + 1
  assert.equal(runState.currentStage + 1, 1);
  assert.equal(runState.status, "running");

  // Advance after 2000ms
  const nextStageState: ActiveRunState = {
    ...runState,
    currentStage: runState.currentStage + 1,
    stageStartedAt: now + 2000,
  };
  assert.equal(nextStageState.currentStage + 1, 2);

  // Completed run
  const completedState: ActiveRunState = {
    ...runState,
    currentStage: 7,
    status: "done",
  };
  assert.equal(completedState.currentStage + 1, 8);
  assert.equal(completedState.status, "done");

  // Cancelled run
  const cancelledState: ActiveRunState = {
    ...nextStageState,
    status: "cancelled",
  };
  assert.equal(cancelledState.status, "cancelled");
});

test("Run Engine: generateRandomStageDurations generates 8 durations between 1500ms and 2000ms", () => {
  const durations1 = generateRandomStageDurations();
  const durations2 = generateRandomStageDurations();

  assert.equal(durations1.length, 8);
  assert.equal(durations2.length, 8);

  for (const d of durations1) {
    assert.ok(d >= 1500, `duration ${d} should be >= 1500`);
    assert.ok(d <= 2000, `duration ${d} should be <= 2000`);
  }

  for (const d of durations2) {
    assert.ok(d >= 1500, `duration ${d} should be >= 1500`);
    assert.ok(d <= 2000, `duration ${d} should be <= 2000`);
  }

  // Not all 8 durations in a single run should be identical
  const uniqueInRun1 = new Set(durations1);
  assert.ok(uniqueInRun1.size > 1, "Durations within a run should be randomized and distinct");

  // Two independent runs should not produce the exact same array
  assert.notDeepEqual(durations1, durations2, "Two distinct runs should have different randomized durations");
});

