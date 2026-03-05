import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCampaignCode, slugify } from "@/lib/tokens";

/**
 * POST /api/campaigns
 *
 * Create a new campaign with target email addresses.
 */
export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description, createdByEmail, targetEmails, emailTemplate, suggestedSubject } = body;

  if (!name || !createdByEmail) {
    return NextResponse.json(
      { error: "name and createdByEmail are required" },
      { status: 400 }
    );
  }

  if (!targetEmails || !Array.isArray(targetEmails) || targetEmails.length === 0) {
    return NextResponse.json(
      { error: "At least one target email address is required" },
      { status: 400 }
    );
  }

  const slug = slugify(name);
  if (!slug) {
    return NextResponse.json(
      { error: "Campaign name must contain at least one letter or number" },
      { status: 400 }
    );
  }

  // Generate a unique code
  let code: string;
  let identifier: string;
  let attempts = 0;
  do {
    code = generateCampaignCode();
    identifier = `${slug}-${code}`;
    const existing = await prisma.campaign.findUnique({
      where: { identifier },
    });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    return NextResponse.json(
      { error: "Failed to generate unique campaign code" },
      { status: 500 }
    );
  }

  const campaign = await prisma.campaign.create({
    data: {
      identifier,
      slug,
      code,
      name,
      description: description ?? "",
      emailTemplate: emailTemplate ?? null,
      suggestedSubject: suggestedSubject ?? null,
      createdByEmail,
      targets: {
        create: targetEmails.map((email: string) => ({
          email: email.toLowerCase().trim(),
        })),
      },
    },
    include: { targets: true },
  });

  const ccAddress = `start+${identifier}@clock.email`;

  return NextResponse.json({
    ...campaign,
    ccAddress,
    dashboardUrl: `https://clock.email/campaign/${identifier}`,
  });
}
