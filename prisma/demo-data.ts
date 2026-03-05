import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes } from "crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function token() {
  return randomBytes(32).toString("base64url");
}

function daysAgo(days: number, hours = 0) {
  return new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000);
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function main() {
  // Campaign 1: Mattapan Bus Route
  const c1 = await prisma.campaign.upsert({
    where: { identifier: "mattapan-bus-a7k2m" },
    update: {},
    create: {
      identifier: "mattapan-bus-a7k2m",
      slug: "mattapan-bus",
      code: "a7k2m",
      name: "Mattapan Bus Route Restoration",
      description:
        "The 31 bus route was cut in 2024. Mattapan residents depend on it. We're asking the city council to restore service.",
      suggestedSubject: "Restore the 31 bus route for Mattapan residents",
      emailTemplate:
        "Dear Councilor,\n\nI am writing to urge you to support the restoration of the 31 bus route serving Mattapan. Since its cancellation, my commute has doubled and many elderly residents in my neighborhood have lost their primary means of transportation.\n\nThis route served one of Boston's most transit-dependent communities. Cutting it has had a direct and measurable impact on our daily lives.\n\nPlease take action to restore this essential service.\n\nThank you,\n[Your name]",
      createdByEmail: "organizer@example.com",
      targets: {
        create: [
          { email: "gabriela.coletta@boston.gov" },
          { email: "ed.flynn@boston.gov" },
          { email: "brian.worrell@boston.gov" },
        ],
      },
    },
  });

  // Campaign 2: Dorchester Potholes
  const c2 = await prisma.campaign.upsert({
    where: { identifier: "dorchester-potholes-b3x9q" },
    update: {},
    create: {
      identifier: "dorchester-potholes-b3x9q",
      slug: "dorchester-potholes",
      code: "b3x9q",
      name: "Dorchester Pothole Crisis",
      description:
        "Blue Hill Ave has had dangerous potholes for 8 months. DPW has not responded to 311 requests.",
      suggestedSubject: "Dangerous potholes on Blue Hill Ave — immediate action needed",
      createdByEmail: "resident@example.com",
      targets: {
        create: [
          { email: "dpw@boston.gov" },
          { email: "john.fitzgerald@boston.gov" },
        ],
      },
    },
  });

  // Campaign 3: Roxbury School Funding
  const c3 = await prisma.campaign.upsert({
    where: { identifier: "roxbury-schools-c4w1p" },
    update: {},
    create: {
      identifier: "roxbury-schools-c4w1p",
      slug: "roxbury-schools",
      code: "c4w1p",
      name: "Roxbury School Funding Equity",
      description:
        "Per-pupil spending in Roxbury schools is 22% below the city average. We're demanding the school committee address this gap in the next budget cycle.",
      suggestedSubject: "Equitable funding for Roxbury schools",
      createdByEmail: "parent@example.com",
      targets: {
        create: [
          { email: "school.committee@boston.gov" },
          { email: "mayor@boston.gov" },
        ],
      },
    },
  });

  // Campaign 4: Jamaica Plain Crosswalk Safety
  const c4 = await prisma.campaign.upsert({
    where: { identifier: "jp-crosswalk-d8n3r" },
    update: {},
    create: {
      identifier: "jp-crosswalk-d8n3r",
      slug: "jp-crosswalk",
      code: "d8n3r",
      name: "JP Crosswalk Safety",
      description:
        "Three pedestrians have been hit at the Centre St / Seaverns Ave intersection this year. We need a protected crosswalk now.",
      suggestedSubject: "Install protected crosswalk at Centre & Seaverns",
      createdByEmail: "neighbor@example.com",
      targets: {
        create: [
          { email: "transportation@boston.gov" },
        ],
      },
    },
  });

  const demoClocks = [
    // Mattapan Bus — mix of old and recent
    {
      senderEmail: "maria.santos@example.com",
      recipientEmail: "gabriela.coletta@boston.gov",
      campaignIdentifier: c1.identifier,
      subjectLine: "Please restore the 31 bus route — my commute doubled",
      startedAt: daysAgo(47),
      status: "active" as const,
    },
    {
      senderEmail: "james.chen@example.com",
      recipientEmail: "gabriela.coletta@boston.gov",
      campaignIdentifier: c1.identifier,
      subjectLine: "31 bus cancellation is hurting elderly residents",
      startedAt: daysAgo(45),
      resolvedAt: daysAgo(40),
      status: "resolved" as const,
    },
    {
      senderEmail: "aisha.johnson@example.com",
      recipientEmail: "ed.flynn@boston.gov",
      campaignIdentifier: c1.identifier,
      subjectLine: "Bus route 31 — students can't get to school on time",
      startedAt: daysAgo(10),
      status: "response_received" as const,
    },
    {
      senderEmail: "tom.burke@example.com",
      recipientEmail: "brian.worrell@boston.gov",
      campaignIdentifier: c1.identifier,
      subjectLine: "Mattapan transit cuts disproportionately affect low-income residents",
      startedAt: daysAgo(2, 8),
      status: "active" as const,
    },
    {
      senderEmail: "derek.williams@example.com",
      recipientEmail: "ed.flynn@boston.gov",
      campaignIdentifier: c1.identifier,
      subjectLine: "Restore the 31 — my mother can no longer get to her doctor",
      startedAt: daysAgo(5),
      resolvedAt: daysAgo(2),
      status: "resolved" as const,
    },

    // Dorchester Potholes — long-running
    {
      senderEmail: "linda.tran@example.com",
      recipientEmail: "dpw@boston.gov",
      campaignIdentifier: c2.identifier,
      subjectLine: "Dangerous potholes on Blue Hill Ave near Franklin Park",
      startedAt: daysAgo(62),
      status: "disputed" as const,
    },
    {
      senderEmail: "kevin.omalley@example.com",
      recipientEmail: "dpw@boston.gov",
      campaignIdentifier: c2.identifier,
      subjectLine: "My car was damaged by pothole at Blue Hill & Warren",
      startedAt: daysAgo(55),
      status: "active" as const,
    },
    {
      senderEmail: "rosa.martinez@example.com",
      recipientEmail: "john.fitzgerald@boston.gov",
      campaignIdentifier: c2.identifier,
      subjectLine: "Pothole on Dorchester Ave caused a bike accident",
      startedAt: daysAgo(8),
      status: "response_received" as const,
    },

    // Roxbury Schools — fresh campaign, recent clocks
    {
      senderEmail: "natasha.brown@example.com",
      recipientEmail: "school.committee@boston.gov",
      campaignIdentifier: c3.identifier,
      subjectLine: "My child's school has no updated textbooks",
      startedAt: daysAgo(3, 14),
      status: "active" as const,
    },
    {
      senderEmail: "carlos.rivera@example.com",
      recipientEmail: "school.committee@boston.gov",
      campaignIdentifier: c3.identifier,
      subjectLine: "Funding gap is widening — Roxbury schools need equity now",
      startedAt: daysAgo(1, 6),
      status: "active" as const,
    },
    {
      senderEmail: "diana.wright@example.com",
      recipientEmail: "mayor@boston.gov",
      campaignIdentifier: c3.identifier,
      subjectLine: "Mayor Wu: Roxbury students deserve equal resources",
      startedAt: hoursAgo(8),
      status: "active" as const,
    },

    // JP Crosswalk — one resolved quickly, one still waiting
    {
      senderEmail: "sam.park@example.com",
      recipientEmail: "transportation@boston.gov",
      campaignIdentifier: c4.identifier,
      subjectLine: "Third pedestrian hit at Centre & Seaverns — please act",
      startedAt: daysAgo(6),
      resolvedAt: daysAgo(1),
      resolutionBackdatedTo: daysAgo(2),
      status: "resolved" as const,
    },
    {
      senderEmail: "emily.nguyen@example.com",
      recipientEmail: "transportation@boston.gov",
      campaignIdentifier: c4.identifier,
      subjectLine: "Protected crosswalk needed before another accident happens",
      startedAt: hoursAgo(18),
      status: "active" as const,
    },
  ];

  for (const c of demoClocks) {
    const existing = await prisma.clock.findFirst({
      where: { subjectLine: c.subjectLine },
    });
    if (existing) continue;

    const statusHistory = [
      { status: "active" as const, note: "Clock started from inbound email", createdAt: c.startedAt },
    ];

    if (c.status === "response_received") {
      statusHistory.push({
        status: "response_received" as const,
        note: "Resident reported response received but not resolved",
        createdAt: new Date(c.startedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
      });
    } else if (c.status === "disputed") {
      statusHistory.push({
        status: "response_received" as const,
        note: "Government office claimed issue was addressed",
        createdAt: new Date(c.startedAt.getTime() + 15 * 24 * 60 * 60 * 1000),
      });
      statusHistory.push({
        status: "disputed" as const,
        note: "Resident disputed — pothole was only partially filled, still dangerous",
        createdAt: new Date(c.startedAt.getTime() + 17 * 24 * 60 * 60 * 1000),
      });
    } else if (c.status === "resolved") {
      statusHistory.push({
        status: "resolved" as const,
        note: "Response received and confirmed",
        createdAt: ("resolvedAt" in c && c.resolvedAt) ? c.resolvedAt as Date : new Date(),
      });
    }

    await prisma.clock.create({
      data: {
        senderEmail: c.senderEmail,
        recipientEmail: c.recipientEmail,
        campaignIdentifier: c.campaignIdentifier,
        subjectLine: c.subjectLine,
        startedAt: c.startedAt,
        status: c.status,
        resolvedAt: ("resolvedAt" in c ? c.resolvedAt : null) as Date | null,
        resolutionBackdatedTo: ("resolutionBackdatedTo" in c ? c.resolutionBackdatedTo : null) as Date | null,
        checkInToken: token(),
        statusHistory: { create: statusHistory },
      },
    });
  }

  console.log("Demo data created: 4 campaigns, 14 clocks.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
