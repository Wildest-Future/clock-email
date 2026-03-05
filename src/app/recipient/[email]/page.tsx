import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ClockRow } from "@/components/clock-row";
import type { Metadata } from "next";
import type { Clock, Campaign } from "@/generated/prisma";

type ClockWithCampaign = Clock & { campaign: Campaign };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ email: string }>;
}): Promise<Metadata> {
  const { email: encodedEmail } = await params;
  const email = decodeURIComponent(encodedEmail);
  const count = await prisma.clock.count({ where: { recipientEmail: email } });
  if (count === 0) return {};
  return {
    title: email,
    description: `${count} clock${count !== 1 ? "s" : ""} tracking response time for ${email}.`,
    openGraph: {
      title: `${email} — clock.email`,
      description: `${count} clock${count !== 1 ? "s" : ""} tracking government response time.`,
    },
  };
}

export default async function RecipientPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email: encodedEmail } = await params;
  const email = decodeURIComponent(encodedEmail);

  const clocks = await prisma.clock.findMany({
    where: { recipientEmail: email },
    orderBy: { startedAt: "asc" },
    include: { campaign: true },
  });

  if (clocks.length === 0) notFound();

  const active = clocks.filter((c: ClockWithCampaign) => c.status !== "resolved" && c.status !== "inactive");
  const resolved = clocks.filter((c: ClockWithCampaign) => c.status === "resolved");

  // Average response time for resolved clocks (in ms)
  let avgResponseMs: number | null = null;
  if (resolved.length > 0) {
    const totalMs = resolved.reduce((sum: number, c: ClockWithCampaign) => {
      const start = c.startedAt.getTime();
      const end = (c.resolutionBackdatedTo ?? c.resolvedAt!).getTime();
      return sum + (end - start);
    }, 0);
    avgResponseMs = totalMs / resolved.length;
  }

  function formatDuration(ms: number): string {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""}`;
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${hours} hour${hours !== 1 ? "s" : ""}, ${minutes} min`;
  }

  // Longest active clock
  const longestActive = active[0];
  const longestActiveMs = longestActive
    ? Date.now() - longestActive.startedAt.getTime()
    : null;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-sand-600 hover:text-bronze transition-colors">
        &larr; All campaigns
      </Link>

      {/* Header */}
      <div className="mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink break-all font-mono">
          {email}
        </h1>
        <p className="text-sand-600 mt-1">
          Accountability profile for this recipient
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <div className="bg-paper rounded-lg border border-sand-300 px-4 py-3 text-center">
          <span className="text-xl font-bold text-ink block">{clocks.length}</span>
          <span className="text-xs text-sand-600">total clocks</span>
        </div>
        <div className="bg-paper rounded-lg border border-sand-300 px-4 py-3 text-center">
          <span className="text-xl font-bold text-oxide block">{active.length}</span>
          <span className="text-xs text-sand-600">active</span>
        </div>
        <div className="bg-paper rounded-lg border border-sand-300 px-4 py-3 text-center">
          <span className="text-xl font-bold text-ok block">{resolved.length}</span>
          <span className="text-xs text-sand-600">resolved</span>
        </div>
        <div className="bg-paper rounded-lg border border-sand-300 px-4 py-3 text-center">
          <span className="text-xl font-bold text-velvet-500 block">
            {resolved.length > 0 && clocks.length > 0
              ? `${Math.round((resolved.length / clocks.length) * 100)}%`
              : "—"}
          </span>
          <span className="text-xs text-sand-600">response rate</span>
        </div>
      </div>

      {/* Response time stats */}
      <div className="mt-6 bg-stone rounded-xl border border-sand-300 p-5 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-sand-600">Average response time</span>
          <span className="font-mono text-sm text-ink">
            {avgResponseMs ? formatDuration(avgResponseMs) : "No responses yet"}
          </span>
        </div>
        {longestActiveMs && (
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-sand-600">Longest unanswered</span>
            <span className="font-mono text-sm text-oxide">
              {formatDuration(longestActiveMs)}
            </span>
          </div>
        )}
      </div>

      {/* Clocks */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-sand-600 uppercase tracking-wide mb-3">
          All clocks for this recipient
        </h2>
        <div className="bg-paper rounded-xl border border-sand-300 overflow-hidden">
          <div className="divide-y divide-sand-300">
            {clocks.map((clock: ClockWithCampaign) => (
              <ClockRow
                key={clock.id}
                id={clock.id}
                subjectLine={clock.subjectLine}
                status={clock.status}
                startedAt={clock.startedAt.toISOString()}
                resolvedAt={clock.resolvedAt?.toISOString()}
                resolutionBackdatedTo={clock.resolutionBackdatedTo?.toISOString()}
                campaignName={clock.campaign.name}
                campaignIdentifier={clock.campaign.identifier}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
