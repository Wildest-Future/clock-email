"use server";

import { prisma } from "@/lib/db";
import { getAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/send-email";

async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin.authenticated) throw new Error("Unauthorized");
  return admin;
}

// ─── Domain actions ─────────────────────────────────────────────

export async function approveDomain(formData: FormData) {
  const admin = await requireAdmin();
  const domain = formData.get("domain") as string;
  const reason = (formData.get("reason") as string) || "Approved by admin";

  await prisma.domain.update({
    where: { domain },
    data: {
      status: "approved",
      reviewedAt: new Date(),
      reviewedBy: admin.name,
      reason,
    },
  });

  // Restore any clocks that were auto-hidden by user flags at this domain
  await prisma.clock.updateMany({
    where: {
      recipientEmail: { endsWith: `@${domain}` },
      hidden: true,
      hiddenReason: "flagged_by_user",
    },
    data: { hidden: false, hiddenReason: null },
  });

  revalidatePath("/admin");
}

export async function blockDomain(formData: FormData) {
  const admin = await requireAdmin();
  const domain = formData.get("domain") as string;
  const reason = formData.get("reason") as string;

  if (!reason) throw new Error("Reason required for blocking");

  await prisma.domain.update({
    where: { domain },
    data: {
      status: "blocked",
      reviewedAt: new Date(),
      reviewedBy: admin.name,
      reason,
    },
  });

  // Hide all clocks at this domain
  const affectedClocks = await prisma.clock.findMany({
    where: {
      recipientEmail: { endsWith: `@${domain}` },
      hidden: false,
    },
    select: { senderEmail: true },
  });

  await prisma.clock.updateMany({
    where: {
      recipientEmail: { endsWith: `@${domain}` },
    },
    data: { hidden: true, hiddenReason: "domain_blocked" },
  });

  // Notify unique senders
  const senders = [...new Set(affectedClocks.map((c) => c.senderEmail))];
  for (const senderEmail of senders) {
    sendEmail({
      to: senderEmail,
      subject: "clock.email — your clock has been hidden",
      text: `A moderator has determined that ${domain} is not a government domain. Clocks tracking this domain have been hidden from public view.\n\nIf you believe this is a mistake, please visit https://clock.email/transparency to submit the domain for review.\n\n— clock.email`,
      html: `<p>A moderator has determined that <strong>${domain}</strong> is not a government domain. Clocks tracking this domain have been hidden from public view.</p><p>If you believe this is a mistake, please visit <a href="https://clock.email/transparency">our transparency page</a> to submit the domain for review.</p>`,
    }).catch((err) => console.error(`Failed to notify ${senderEmail}:`, err));
  }

  revalidatePath("/admin");
}

export async function addDomain(formData: FormData) {
  const admin = await requireAdmin();
  const domain = (formData.get("domain") as string).toLowerCase().trim();
  const status = formData.get("status") as "approved" | "blocked" | "pending";
  const reason = (formData.get("reason") as string) || undefined;

  await prisma.domain.upsert({
    where: { domain },
    update: {
      status,
      reviewedAt: new Date(),
      reviewedBy: admin.name,
      reason,
    },
    create: {
      domain,
      status,
      submittedBy: admin.name,
      reviewedAt: new Date(),
      reviewedBy: admin.name,
      reason,
    },
  });

  revalidatePath("/admin");
}

export async function updateDomainStatus(formData: FormData) {
  const domain = formData.get("domain") as string;
  const newStatus = formData.get("status") as string;

  if (newStatus === "blocked") {
    return blockDomain(formData);
  }
  if (newStatus === "approved") {
    return approveDomain(formData);
  }

  // For pending status
  const admin = await requireAdmin();
  await prisma.domain.update({
    where: { domain },
    data: {
      status: "pending",
      reviewedAt: new Date(),
      reviewedBy: admin.name,
      reason: (formData.get("reason") as string) || "Moved to pending",
    },
  });

  revalidatePath("/admin");
}

// ─── Clock actions ──────────────────────────────────────────────

export async function hideClock(formData: FormData) {
  await requireAdmin();
  const clockId = formData.get("clockId") as string;
  const reason = formData.get("reason") as string;

  await prisma.clock.update({
    where: { id: clockId },
    data: { hidden: true, hiddenReason: reason || "admin_manual" },
  });

  revalidatePath("/admin");
}

export async function unhideClock(formData: FormData) {
  await requireAdmin();
  const clockId = formData.get("clockId") as string;

  await prisma.clock.update({
    where: { id: clockId },
    data: { hidden: false, hiddenReason: null },
  });

  revalidatePath("/admin");
}

export async function deleteClock(formData: FormData) {
  await requireAdmin();
  const clockId = formData.get("clockId") as string;

  await prisma.clock.delete({
    where: { id: clockId },
  });

  revalidatePath("/admin");
}

// ─── Campaign actions ───────────────────────────────────────────

export async function hideCampaign(formData: FormData) {
  await requireAdmin();
  const identifier = formData.get("identifier") as string;

  await prisma.campaign.update({
    where: { identifier },
    data: { hidden: true },
  });

  // Hide all clocks in this campaign
  await prisma.clock.updateMany({
    where: { campaignIdentifier: identifier },
    data: { hidden: true, hiddenReason: "campaign_hidden" },
  });

  revalidatePath("/admin");
}

export async function unhideCampaign(formData: FormData) {
  await requireAdmin();
  const identifier = formData.get("identifier") as string;

  await prisma.campaign.update({
    where: { identifier },
    data: { hidden: false },
  });

  // Restore clocks hidden because of campaign
  await prisma.clock.updateMany({
    where: {
      campaignIdentifier: identifier,
      hiddenReason: "campaign_hidden",
    },
    data: { hidden: false, hiddenReason: null },
  });

  revalidatePath("/admin");
}

export async function deleteCampaign(formData: FormData) {
  await requireAdmin();
  const identifier = formData.get("identifier") as string;

  // Cascade delete handles clocks, targets, status events
  await prisma.campaign.delete({
    where: { identifier },
  });

  revalidatePath("/admin");
}
