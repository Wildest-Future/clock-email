import { prisma } from "@/lib/db";

interface DomainEvaluation {
  allowed: boolean;
  domainStatus: "approved" | "blocked" | "pending";
  domain: string;
}

/**
 * Evaluates a recipient's email domain against the domain registry.
 *
 * Logic:
 * 1. If domain is already in the DB, return its status (blocked = not allowed)
 * 2. If domain ends with .gov, auto-approve it
 * 3. Otherwise, add it as pending (still allowed — we err on the side of visibility)
 */
export async function evaluateDomain(
  recipientEmail: string,
  senderEmail?: string
): Promise<DomainEvaluation> {
  const domain = recipientEmail.split("@")[1].toLowerCase();

  const existing = await prisma.domain.findUnique({
    where: { domain },
  });

  if (existing) {
    return {
      allowed: existing.status !== "blocked",
      domainStatus: existing.status,
      domain,
    };
  }

  // Auto-approve .gov domains
  if (domain.endsWith(".gov")) {
    await prisma.domain.create({
      data: {
        domain,
        status: "approved",
        submittedBy: "system",
      },
    });
    return { allowed: true, domainStatus: "approved", domain };
  }

  // Unknown domain — add as pending, allow clock creation
  await prisma.domain.create({
    data: {
      domain,
      status: "pending",
      submittedBy: senderEmail ?? "unknown",
    },
  });
  return { allowed: true, domainStatus: "pending", domain };
}
