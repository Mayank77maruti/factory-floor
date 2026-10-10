import { test } from "node:test";
import assert from "node:assert/strict";
import { getDrawingVariant, VARIANT_A, VARIANT_B, VARIANT_C } from "../app/app/drawingVariants";

test("Drawing Variants: Normalized 'clevis.step' resolves to VARIANT A", () => {
  const v1 = getDrawingVariant("clevis.step");
  assert.equal(v1.id, "variant-a");
  assert.equal(v1.titleBlock.title, "CLEVIS MOUNT BRACKET");
  assert.equal(v1.titleBlock.dwgNo, "MF-2026-0881");
  assert.equal(v1.issues.length, 14);

  const v2 = getDrawingVariant("  CLEVIS.STEP  ");
  assert.equal(v2.id, "variant-a");
});

test("Drawing Variants: Uploading custom file 'my_part.step' resolves deterministically to flange or housing", () => {
  const v = getDrawingVariant("my_part.step");
  // "my_part.step" sum is 1144 (even) -> VARIANT B (Mounting Flange, 9 issues)
  assert.equal(v.id, "variant-b");
  assert.equal(v.titleBlock.title, "MOUNTING FLANGE");
  assert.equal(v.titleBlock.dwgNo, "MF-2026-0912");
  assert.equal(v.issues.length, 9);
  // Same file always returns the same variant
  assert.equal(getDrawingVariant("my_part.step").id, "variant-b");
});

test("Drawing Variants: Arbitrary filenames deterministically map to B (even) or C (odd)", () => {
  // "ab" -> 97 + 98 = 195 (odd) -> C (Bearing housing, 6 issues)
  const vOdd = getDrawingVariant("ab");
  assert.equal(vOdd.id, "variant-c");
  assert.equal(vOdd.titleBlock.title, "BEARING HOUSING");
  assert.equal(vOdd.issues.length, 6);

  // "ac" -> 97 + 99 = 196 (even) -> B (Mounting flange, 9 issues)
  const vEven = getDrawingVariant("ac");
  assert.equal(vEven.id, "variant-b");
  assert.equal(vEven.titleBlock.title, "MOUNTING FLANGE");
  assert.equal(vEven.issues.length, 9);

  // Repeated calls with same name are consistent
  assert.equal(getDrawingVariant("my-motor-mount.step").id, getDrawingVariant("my-motor-mount.step").id);
});

test("Drawing Variants: No undefined title block or note fields", () => {
  for (const variant of [VARIANT_A, VARIANT_B, VARIANT_C]) {
    assert.ok(variant.titleBlock.title);
    assert.ok(variant.titleBlock.dwgNo);
    assert.ok(variant.titleBlock.material);
    assert.ok(variant.titleBlock.finish);
    assert.ok(variant.titleBlock.rev);
    assert.ok(variant.titleBlock.revStatus);
    assert.ok(variant.titleBlock.scale);
    assert.ok(variant.titleBlock.drawnBy);
    assert.ok(variant.titleBlock.date);
    assert.ok(variant.titleBlock.sheet);
    assert.ok(variant.notes.length > 0);
    assert.ok(variant.issues.length > 0);
    assert.ok(variant.downloadFileName.endsWith(".svg"));
  }
});

test("Agreement: DrawingSheet issue count and Projects card findings agree for all variants", async () => {
  const { getProjectFindings } = await import("../app/architect/components/ProjectsView");
  const { DEFAULT_MOCK_PROJECTS } = await import("../lib/types/projects");

  // 1. Clevis bracket
  const clevisProject = DEFAULT_MOCK_PROJECTS.find((p) => p.id === "proj-clevis")!;
  const clevisVariant = getDrawingVariant("clevis.step");
  const clevisFindings = getProjectFindings(clevisProject);
  assert.equal(clevisFindings.text, `${clevisVariant.issues.length} LAYOUT ISSUES`);
  assert.equal(clevisVariant.issues.length, 14);

  // 2. Flange project (using my_part.step which hashes to even -> Variant B)
  const flangeProject = {
    ...clevisProject,
    id: "proj-flange",
    name: "Mounting flange",
    sourceFileName: "my_part.step",
    runsList: [
      {
        moduleName: "AUTODRAFT" as const,
        moduleCode: "01-autodraft" as const,
        runTitle: "STEP to drawing · my_part.step",
        fileName: "my_part.step",
        result: "9 ISSUES",
        resultType: "warn" as const,
        date: "OCT 10",
        isDemo: false,
      },
    ],
  };
  const flangeVariant = getDrawingVariant("my_part.step");
  const flangeFindings = getProjectFindings(flangeProject);
  assert.equal(flangeFindings.text, `${flangeVariant.issues.length} LAYOUT ISSUES`);
  assert.equal(flangeVariant.issues.length, 9);

  // 3. Housing project
  const housingProject = {
    ...clevisProject,
    id: "proj-housing",
    name: "Bearing housing",
    sourceFileName: "housing.step",
    runsList: [
      {
        moduleName: "AUTODRAFT" as const,
        moduleCode: "01-autodraft" as const,
        runTitle: "STEP to drawing · housing.step",
        fileName: "housing.step",
        result: "6 ISSUES",
        resultType: "warn" as const,
        date: "OCT 10",
        isDemo: false,
      },
    ],
  };
  const housingVariant = getDrawingVariant("housing.step");
  const housingFindings = getProjectFindings(housingProject);
  assert.equal(housingFindings.text, `${housingVariant.issues.length} LAYOUT ISSUES`);
  assert.equal(housingVariant.issues.length, 6);

  // 4. Project with legacy "DRAWING GENERATED" stored findings
  const legacyProject = {
    ...clevisProject,
    findings: "DRAWING GENERATED",
    findingsType: "clear" as const,
  };
  const legacyFindings = getProjectFindings(legacyProject);
  assert.equal(legacyFindings.text, "14 LAYOUT ISSUES");
});

