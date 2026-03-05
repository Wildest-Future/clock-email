import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/send-email";
import { checkInEmail } from "@/lib/email-templates";
import type { Clock, Campaign } from "@/generated/prisma";

type ClockWithCampaign = Clock & { campaign: Campaign };

/**
 * POST /api/cron/check-ins
 *
 * Sends check-in emails to clock creators on a degrading schedule.
 * Meant to be called by a cron job (e.g., daily).
 *
 * Schedule: 1 day, 3 days, 7 days, 14 days, 30 days, then every 30 days.
 */

const CHECK_IN_DAYS = [1, 3, 7, 14, 30];

function nextCheckInDay(daysSinceStart: number, daysSinceLastCheckIn: number | null): boolean {
  // If never sent, check against the schedule
  if (daysSinceLastCheckIn === null) {
    return CHECK_IN_DAYS.some((d) => daysSinceStart >= d);
  }

  // After the initial schedule, check in every 30 days
  for (const d of CHECK_IN_DAYS) {
    if (daysSinceStart >= d && daysSinceLastCheckIn >= (d === 1 ? 1 : d - (CHECK_IN_DAYS[CHECK_IN_DAYS.indexOf(d) - 1] ?? 0))) {
      // Simplified: just check if enough time has passed since last check-in
    }
  }

  // Simple approach: find the next milestone we haven't passed
  if (daysSinceStart >= 30) return daysSinceLastCheckIn >= 30;
  if (daysSinceStart >= 14) return daysSinceLastCheckIn >= 14;
  if (daysSinceStart >= 7) return daysSinceLastCheckIn >= 7;
  if (daysSinceStart >= 3) return daysSinceLastCheckIn >= 3;
  if (daysSinceStart >= 1) return daysSinceLastCheckIn >= 1;

  return false;
}

export async function POST(request: NextRequest) {
  // Simple auth via shared secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Find all active clocks that are at least 1 day old
  const clocks = await prisma.clock.findMany({
    where: {
      status: { in: ["active", "response_received", "disputed"] },
      startedAt: { lte: new Date(now - oneDayMs) },
    },
    include: { campaign: true },
  });

  let sent = 0;

  for (const clock of clocks as ClockWithCampaign[]) {
    const daysSinceStart = Math.floor((now - clock.startedAt.getTime()) / oneDayMs);
    const daysSinceLastCheckIn = clock.lastCheckInSent
      ? Math.floor((now - clock.lastCheckInSent.getTime()) / oneDayMs)
      : null;

    if (!nextCheckInDay(daysSinceStart, daysSinceLastCheckIn)) continue;

    const email = checkInEmail({
      clockId: clock.id,
      checkInToken: clock.checkInToken,
      senderEmail: clock.senderEmail,
      recipientEmail: clock.recipientEmail,
      campaignName: clock.campaign.name,
      subjectLine: clock.subjectLine,
      daysSinceStart,
    });

    try {
      await sendEmail(email);
      await prisma.clock.update({
        where: { id: clock.id },
        data: { lastCheckInSent: new Date() },
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send check-in for clock ${clock.id}:`, err);
    }
  }

  return NextResponse.json({ message: `Sent ${sent} check-in email(s)`, sent });
}
