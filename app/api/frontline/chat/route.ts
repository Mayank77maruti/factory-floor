import { NextRequest, NextResponse } from "next/server";
import { formatFrontlinePlainText } from "@/lib/frontline/format";
import { classifyFrontlineIntent } from "@/lib/frontline/router";
import { retrieveMockRecords } from "@/lib/frontline/retriever";
import { FRONTLINE_SUMMARY_SYSTEM_INSTRUCTION } from "@/lib/gcp/prompts/frontline";
import { callGeminiText, callGeminiMultimodalText } from "@/lib/gcp/vertexai";
import {
  FRONTLINE_GUARDRAIL_MESSAGE,
  FRONTLINE_PHOTO_REJECTION_MESSAGE,
  diagnoseMachinePart,
  isExplicitSafetyOrLoosenessQuestion,
} from "@/lib/mock/frontlineData";
import { saveFrontlineTicket } from "@/lib/db/tickets";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const query = typeof body?.query === "string" ? body.query.trim() : "";
    const personaId = typeof body?.personaId === "string" ? body.personaId : undefined;
    const canApprovePo = Boolean(body?.canApprovePo);
    const image = body?.image;

    // Allow empty query only if photo is attached
    if (!query && (!image || !image.data)) {
      return NextResponse.json(
        { error: "Query parameter cannot be empty." },
        { status: 400 }
      );
    }

    // Enforce message length limit
    if (query.length > 2000) {
      return NextResponse.json(
        { error: "Query exceeds maximum allowed length of 2000 characters." },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------------------------
    // Case 1: Photo Inspection with Gemini Multimodal Vision / OCR & Ticket Assignment
    // ---------------------------------------------------------------------------
    if (image && image.data) {
      const imageName = typeof image.name === "string" ? image.name : "machine_part.jpg";
      const mimeType = typeof image.mimeType === "string" ? image.mimeType : "image/jpeg";
      const cleanBase64 = image.data.replace(/^data:[^;]+;base64,/, "");

      let geminiOcrText = "";
      let geminiIsNonMachine = false;
      let geminiResponseText = "";

      const shopFloorContext = `
FACTORY OPERATIONAL CONTEXT & COMPONENT SPECIFICATIONS (from frontlineData.ts):
- FASTENERS & HARDWARE:
  • Part: M4 Torx Pan-Head Machine Screw (Grade 8.8 zinc-plated).
  • Application: Station 4 Assembly / Tool Crib B (Bin C-12, 140 on hand).
  • Torque Spec: Standard tightening torque is 3.5 Nm per SOP-ASM-02.
  • Condition: Clean drive recess, intact metric thread pitch, no stripping. Clean fasteners are safe to use.
- ENGINE LINE 2 MOUNTING BRACKET:
  • Part: Steel Mounting Bracket (BRK-ENG-02).
  • Status: Active defect reported (W-3321 / W-3324). Known mechanical loosening and fastener displacement off datum.
  • Safety Rule: Loose bracket risks severe misalignment on Engine Line 2. Requires immediate work pause, lockout, and 45 Nm torque check per SOP-ENG-14 by Marcus T. (Maintenance).
- PRESS 3 HYDRAULIC RELIEF VALVE:
  • Part: Hydraulic Relief Valve (VLV-PRS-03).
  • Status: Fluid seepage and manifold temperature 13° over spec. Requires accumulator depressurization and Viton O-ring seal replacement (W-3325) by Marcus T.
- CNC-3 COOLANT PUMP:
  • Part: Mechanical Coolant Pump Seal (PMP-CNC-03).
  • Status: Seal degraded, coolant pressure dropping below 15 PSI. Waiting parts (W-3326, seal kit arriving Thursday).
- STATION 4 TURNING INSERT:
  • Part: CNMG 432 Carbide Turning Insert.
  • Status: Flank wear >0.35 mm, micro-fractures (W-3327). Tool Crib B has 3 in stock.
- CONVEYOR 3 BEARING:
  • Part: 6205-2RS Deep Groove Ball Bearing.
  • Status: Severe raceway wear and grease seal breach (W-3328). Tool Crib B has 2 in stock.
- PERSONNEL:
  • Marcus T. (Shift 2 Maintenance lead) handles mechanical repairs, torque calibrations, and safety stops.
`;

      const isExplicitSafety = isExplicitSafetyOrLoosenessQuestion(query);

      // 1. Run Gemini Multimodal Vision & OCR if model endpoint is available
      try {
        const multimodalPrompt = `You are the Astraea Frontline AI assistant operating on an automotive manufacturing shop floor.
You have access to shop-floor data from frontlineData.ts:
${shopFloorContext}

OPERATOR QUESTION / REMARK:
"${query || "Inspect this component"}"

IMAGE:
Photo attached by the operator (Filename: "${imageName}").

TASK:
1. VISION & OCR:
   - Carefully inspect the photo. Perform OCR to read any text, part numbers, thread sizes, drive markings (e.g. Torx, hex), or labels.
   - Determine whether the image is an industrial manufacturing machine part, equipment, tool, fastener, screw, bolt, nut, hardware, or factory component.
   - Fasteners (screws, bolts, nuts, washers, studs, pins) ARE valid machine parts.
   - If the image is NOT an industrial component (e.g. human face, selfie, pet, animal, food, dish, household furniture, consumer electronic gadget, clothes, shoes, nature, car):
     Respond ONLY with:
     NON_MACHINE_PART: I can only assist with factory machinery, industrial equipment, and tooling parts. Please provide an image of a shop-floor machine or mechanical component.

2. CONTEXTUAL REASONING & WORK STOPPAGE CRITERIA:
   - CRITICAL SAFETY STOP RULE:
     Only instruct the operator to pause/stop work and trigger a safety stop if:
     (a) The operator EXPLICITLY asks if it is safe to work, if the part is safe to use, or if the part is loose (e.g. "is it safe to work", "is this screw safe to use", "is this bracket is loose is it safe to use", "this part is loose or not", "should I stop"); AND
     (b) The component is actually loose, leaking, broken, or in an unsafe hazardous state (such as the loose Engine Line 2 steel bracket, or leaking Press 3 hydraulic valve).
   - INFORMATIONAL / IDENTIFICATION QUERIES:
     If the operator merely identifies or asks about the part without asking for a safety stoppage (e.g. "this is a screw", "what part is this", "identify this", "check this screw"):
     DO NOT say to pause or stop work! State what the part is, its specifications (e.g. M4 Torx pan-head machine screw per SOP-ASM-02), Tool Crib B inventory status, and standard tightening torque. Do NOT issue any safety alerts or work order tickets.
   - SAFE COMPONENT INSPECTION:
     If the operator asks if a clean/intact fastener or part is safe to use (e.g. "is this screw safe to use ?"):
     Confirm that it is clean, intact, and safe to use with standard torque (3.5 Nm per SOP-ASM-02). Do NOT say to pause work.
   - UNSAFE / LOOSE COMPONENT SAFETY INQUIRY:
     If the operator asks about safety or looseness on an unsafe part (e.g. "is this bracket is loose is it safe to use", "is it safe to work"):
     State: "No, it is not safe. Pause the work immediately." Explain the mechanical loosening / fastener displacement off datum, and confirm work order W-3324 is assigned to Marcus T. in the Maintenance team.

3. OUTPUT FORMAT:
   - Strictly plain text. No markdown formatting (no **, no ##, no \`, no bullet dashes).
   - Direct, factual, and professional tone suitable for a factory operator.`;

        const multimodalRes = await callGeminiMultimodalText({
          systemInstruction:
            "You are an industrial manufacturing inspection vision AI. You only assist with shop-floor machinery, tools, fasteners, and mechanical parts. Output strictly plain text without markdown formatting.",
          parts: [
            { text: multimodalPrompt },
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
          ],
          temperature: 0.1,
          stageName: "frontline-image-inspection",
        });

        if (multimodalRes.text) {
          geminiOcrText = multimodalRes.text;
          if (
            geminiOcrText.includes("NON_MACHINE_PART") ||
            geminiOcrText.toLowerCase().includes("not an industrial machine")
          ) {
            geminiIsNonMachine = true;
          } else {
            geminiResponseText = formatFrontlinePlainText(geminiOcrText);
          }
        }
      } catch (geminiErr) {
        console.warn(
          "[Frontline Chat Route] Multimodal inspection fallback to deterministic shop-floor logic:",
          geminiErr
        );
      }

      // 2. Validate using deterministic machine part diagnostic & non-machine detection
      const diag = diagnoseMachinePart({
        query: query || "inspect part",
        imageName,
        ocrText: geminiOcrText,
      });

      // 3. Rejection if not a factory machine part
      if (geminiIsNonMachine || !diag.isMachinePart) {
        return NextResponse.json({
          path: "PATH_IMAGE_REJECTED",
          isMachinePart: false,
          isSafetyStop: false,
          text: FRONTLINE_PHOTO_REJECTION_MESSAGE,
        });
      }

      // 4. Determine whether this is a safety stop
      // A safety stop occurs ONLY if:
      // - The user explicitly asked a safety or looseness question AND
      // - The part is actually unsafe or loose (diag.isSafetyStop === true)
      const isSafetyStop = Boolean(isExplicitSafety && diag.isSafetyStop);

      let responseText = diag.message;
      if (geminiResponseText) {
        const lowerRes = geminiResponseText.toLowerCase();
        // If it's NOT an explicit safety question, ensure response never says to pause/stop work
        if (!isExplicitSafety && (lowerRes.includes("pause the work") || lowerRes.includes("not safe"))) {
          responseText = diag.message;
        } else if (isSafetyStop && !lowerRes.includes("pause the work") && !lowerRes.includes("not safe")) {
          responseText = diag.message;
        } else {
          responseText = geminiResponseText;
        }
      }

      // 5. If it is a safety stop, persist ticket to Cloud Storage + Firestore
      let ticketToSave = undefined;
      let savedRecord = undefined;

      if (isSafetyStop && diag.ticket) {
        ticketToSave = diag.ticket;
        savedRecord = await saveFrontlineTicket({
          ticket: {
            code: ticketToSave.code,
            title: ticketToSave.title,
            status: ticketToSave.status,
            meta: ticketToSave.meta,
            icon: ticketToSave.icon,
          },
          assignedTo: ticketToSave.assignedToPersonaId || "marcus",
          query: query || "Attached part photo inspection",
          diagnosis: responseText,
          checklist: diag.checklist,
          image: {
            name: imageName,
            data: image.data,
            mimeType,
          },
        });
      }

      return NextResponse.json({
        path: "PATH_IMAGE_ACCEPTED",
        isMachinePart: true,
        isSafetyStop,
        text: responseText,
        ticket: ticketToSave,
        checklist: isSafetyStop ? diag.checklist : undefined,
        savedTicketRecord: savedRecord,
        sopReference: diag.diagnostic?.sopReference,
      });
    }

    // ---------------------------------------------------------------------------
    // Case 2: Direct bracket looseness safety stop inquiry (text-only)
    // ---------------------------------------------------------------------------
    const qLower = query.toLowerCase();
    if (
      (qLower.includes("bracket") && (qLower.includes("loose") || qLower.includes("safe"))) ||
      (qLower.includes("loose") && qLower.includes("safe"))
    ) {
      const diag = diagnoseMachinePart({ query });
      const ticketToSave = diag.ticket || {
        code: "W-3324",
        title: "Fix loose steel bracket — Engine Line 2",
        status: "HIGH" as const,
        meta: "ASSIGNED TO MARCUS T. · SAFETY STOP",
        icon: "wrench" as const,
        assignedToPersonaId: "marcus",
      };

      const savedRecord = await saveFrontlineTicket({
        ticket: {
          code: ticketToSave.code,
          title: ticketToSave.title,
          status: ticketToSave.status,
          meta: ticketToSave.meta,
          icon: ticketToSave.icon,
        },
        assignedTo: ticketToSave.assignedToPersonaId || "marcus",
        query,
        diagnosis: diag.message,
        checklist: diag.checklist,
      });

      return NextResponse.json({
        path: "PATH_IMAGE_ACCEPTED",
        isMachinePart: true,
        isSafetyStop: true,
        text: diag.message,
        ticket: ticketToSave,
        checklist: diag.checklist,
        savedTicketRecord: savedRecord,
        sopReference: diag.diagnostic?.sopReference,
      });
    }

    // ---------------------------------------------------------------------------
    // Case 3: Standard Router (Path A, Path B, Path C)
    // ---------------------------------------------------------------------------
    const decision = classifyFrontlineIntent(query, {
      canApprovePo,
      currentPersonaId: personaId,
    });

    // Path A: Canned interaction
    if (decision.path === "PATH_A") {
      return NextResponse.json({
        path: "PATH_A",
        scenario: decision.scenario,
      });
    }

    // Path C: Out of scope / guardrail
    if (decision.path === "PATH_C") {
      return NextResponse.json({
        path: "PATH_C",
        text: decision.guardrailText || FRONTLINE_GUARDRAIL_MESSAGE,
      });
    }

    // Path B: Analytical reasoning / multi-record summary over mock operational data
    const operationalData = retrieveMockRecords(query, personaId);

    const userPrompt = `MOCK OPERATIONAL RECORDS (SOLE SOURCE OF TRUTH):
${JSON.stringify(operationalData.records, null, 2)}

OPERATOR QUESTION:
"${query}"

INSTRUCTIONS:
1. Output strictly plain text. Do NOT use any Markdown formatting: no asterisks for bold (** or *), no hash symbols (# or ##), no backticks (\`), and no Markdown tables.
2. Directly answer the operator's specific question instead of reproducing the entire mock dataset. Include only records relevant to the question.
3. Do NOT begin with conversational preambles or filler like "Here's a summary of the current shift based on the provided records:" or "Based on the records:". Begin immediately with the operational facts.
4. Use clean section titles (e.g. Priority Issues: or Equipment Drift:) followed by standard bullet points (• ) and readable line breaks.
5. Keep equipment IDs, work-order numbers, quantities, units, and timestamps exact and accurate.
6. Ensure all bullet points and sections are completely finished.`;

    const { text, error, latencyMs } = await callGeminiText({
      systemInstruction: FRONTLINE_SUMMARY_SYSTEM_INSTRUCTION,
      prompt: userPrompt,
      temperature: 0.15,
      stageName: "frontline-mock-summary",
    });

    if (error || !text) {
      return NextResponse.json(
        {
          error: "Vertex AI is unavailable to generate operational summary.",
          details: error || "No response received from model endpoint.",
        },
        { status: 503 }
      );
    }

    // Server-side safety filter: strip any lingering Markdown syntax without altering data
    const cleanedText = formatFrontlinePlainText(text);

    return NextResponse.json({
      path: "PATH_B",
      text: cleanedText,
      category: operationalData.category,
      recordCount: operationalData.recordCount,
      latencyMs,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[Frontline Chat Route] Unexpected error:", err);
    return NextResponse.json(
      {
        error: "Internal server error while processing frontline message.",
        details: err.message,
      },
      { status: 500 }
    );
  }
}

