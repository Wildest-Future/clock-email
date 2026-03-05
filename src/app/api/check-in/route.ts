import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/check-in?token=xxx&action=resolved|response_received|no_change
 *
 * One-click response handler from check-in emails.
 * Tokenized — no login required.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const action = request.nextUrl.searchParams.get("action");

  if (!token || !action) {
    return NextResponse.json(
      { error: "Missing token or action" },
      { status: 400 }
    );
  }

  const validActions = ["resolved", "response_received", "no_change"] as const;
  if (!validActions.includes(action as (typeof validActions)[number])) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const clock = await prisma.clock.findUnique({
    where: { checkInToken: token },
  });

  if (!clock) {
    return NextResponse.json({ error: "Clock not found" }, { status: 404 });
  }

  if (clock.status === "resolved" || clock.status === "inactive") {
    return NextResponse.json(
      { message: "This clock is already " + clock.status },
      { status: 200 }
    );
  }

  if (action === "resolved") {
    await prisma.clock.update({
      where: { id: clock.id },
      data: {
        status: "resolved",
        resolvedAt: new Date(),
        statusHistory: {
          create: {
            status: "resolved",
            note: "Resident confirmed resolved via check-in",
          },
        },
      },
    });
  } else if (action === "response_received") {
    await prisma.clock.update({
      where: { id: clock.id },
      data: {
        status: "response_received",
        statusHistory: {
          create: {
            status: "response_received",
            note: "Resident reported response received but not resolved",
          },
        },
      },
    });
  }
  // "no_change" — no update needed, just acknowledge

  // Redirect to the clock page so the resident sees the result
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://clock.email";
  return NextResponse.redirect(`${baseUrl}/clock/${clock.id}?updated=${action}`);
}
