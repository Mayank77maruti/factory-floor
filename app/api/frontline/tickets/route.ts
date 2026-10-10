import { NextRequest, NextResponse } from "next/server";
import { listFrontlineTickets, saveFrontlineTicket } from "@/lib/db/tickets";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tickets = await listFrontlineTickets();
    return NextResponse.json({ tickets });
  } catch (error) {
    logError("GET /api/frontline/tickets failed", error);
    return NextResponse.json(
      { error: "Failed to retrieve frontline tickets." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.ticket || !body?.ticket?.code) {
      return NextResponse.json(
        { error: "Ticket code and details are required." },
        { status: 400 }
      );
    }

    const saved = await saveFrontlineTicket({
      ticket: body.ticket,
      assignedTo: body.assignedTo || "marcus",
      query: body.query,
      diagnosis: body.diagnosis,
      checklist: body.checklist,
      image: body.image,
    });

    return NextResponse.json({ success: true, ticket: saved });
  } catch (error) {
    logError("POST /api/frontline/tickets failed", error);
    return NextResponse.json(
      { error: "Failed to save frontline ticket." },
      { status: 500 }
    );
  }
}

