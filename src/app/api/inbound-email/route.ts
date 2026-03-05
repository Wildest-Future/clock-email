import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseInboundEmail } from "@/lib/parse-inbound";
import { generateCheckInToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/send-email";
import { clockStartedEmail, newClockNotificationEmail } from "@/lib/email-templates";

/**
 * POST /api/inbound-email
 *
 * Webhook endpoint for Postal. Receives inbound email data,
 * parses it, and creates clock records.
 *
 * Campaign-centric: a valid campaign identifier in the plus-tag is required.
 * The TO address must match one of the campaign's target emails.
 */
export async function POST(request: NextRequest) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseInboundEmail(payload);

  if (!parsed.clockEmailRecipient) {
    return NextResponse.json(
      { error: "No clock.email address found in recipients" },
      { status: 400 }
    );
  }

  if (!parsed.campaignIdentifier) {
    return NextResponse.json(
      { error: "No campaign identifier in CC address. Use start+[campaign]@clock.email" },
      { status: 400 }
    );
  }

  if (parsed.governmentRecipients.length === 0) {
    return NextResponse.json(
      { error: "No recipient found besides clock.email" },
      { status: 400 }
    );
  }

  // Look up the campaign
  const campaign = await prisma.campaign.findUnique({
    where: { identifier: parsed.campaignIdentifier },
    include: { targets: true },
  });

  if (!campaign) {
    return NextResponse.json(
      { error: "Campaign not found" },
      { status: 404 }
    );
  }

  const targetEmails = new Set(campaign.targets.map((t) => t.email.toLowerCase()));

  // Deduplicate by message-id
  if (parsed.messageId) {
    const existing = await prisma.clock.findUnique({
      where: { messageId: parsed.messageId },
    });
    if (existing) {
      return NextResponse.json(
        { message: "Clock already exists for this email", clockId: existing.id },
        { status: 200 }
      );
    }
  }

  // Create a clock for each government recipient that matches a campaign target
  const createdClocks = [];

  for (const recipientEmail of parsed.governmentRecipients) {
    if (!targetEmails.has(recipientEmail.toLowerCase())) continue;

    // Duplicate check: same sender, same recipient, same subject, still active
    const duplicate = await prisma.clock.findFirst({
      where: {
        senderEmail: parsed.senderEmail,
        recipientEmail,
        subjectLine: parsed.subjectLine,
        status: { not: "resolved" },
      },
    });
    if (duplicate) continue;

    const clock = await prisma.clock.create({
      data: {
        senderEmail: parsed.senderEmail,
        recipientEmail,
        campaignIdentifier: campaign.identifier,
        subjectLine: parsed.subjectLine,
        startedAt: parsed.timestamp,
        checkInToken: generateCheckInToken(),
        messageId: parsed.messageId,
        statusHistory: {
          create: {
            status: "active",
            note: "Clock started from inbound email",
          },
        },
      },
    });

    createdClocks.push({ id: clock.id, recipientEmail });
  }

  // Send confirmation emails (fire-and-forget, don't block the response)
  for (const created of createdClocks) {
    sendEmail(
      clockStartedEmail({
        clockId: created.id,
        senderEmail: parsed.senderEmail,
        recipientEmail: created.recipientEmail,
        campaignName: campaign.name,
        campaignIdentifier: campaign.identifier,
        subjectLine: parsed.subjectLine,
      }),
    ).catch((err) => console.error(`Failed to send clock-started email:`, err));
  }

  // Notify campaign creator
  if (createdClocks.length > 0) {
    const clockCount = await prisma.clock.count({
      where: { campaignIdentifier: campaign.identifier },
    });
    sendEmail(
      newClockNotificationEmail({
        campaignName: campaign.name,
        campaignIdentifier: campaign.identifier,
        creatorEmail: campaign.createdByEmail,
        recipientEmail: createdClocks[0].recipientEmail,
        clockCount,
      }),
    ).catch((err) => console.error(`Failed to send creator notification:`, err));
  }

  return NextResponse.json({
    message: `Created ${createdClocks.length} clock(s)`,
    clockIds: createdClocks.map((c) => c.id),
  });
}
