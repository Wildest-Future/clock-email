import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { TickingClock } from "@/components/ticking-clock";
import type { StatusEvent } from "@/generated/prisma";

const statusLabels: Record<string, string> = {
  active: "Active",
  response_received: "Response Received",
  disputed: "Disputed",
  resolved: "Resolved",
  inactive: "Inactive",
};

const statusDotColors: Record<string, string> = {
  active: "#8B504C",
  response_received: "#B57A2A",
  disputed: "#8D3E3A",
  resolved: "#2F7D57",
  inactive: "#C3BEA9",
};

export default async function ClockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const clock = await prisma.clock.findUnique({
    where: { id },
    include: {
      campaign: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!clock) notFound();

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/campaign/${clock.campaign.identifier}`} className="text-sm text-sand-600 hover:text-bronze transition-colors">
        &larr; {clock.campaign.name}
      </Link>

      {/* Timer hero */}
      <div className="mt-6 bg-velvet-700 rounded-xl px-8 py-8 text-center">
        <TickingClock
          startedAt={clock.startedAt.toISOString()}
          resolvedAt={clock.resolvedAt?.toISOString()}
          resolutionBackdatedTo={clock.resolutionBackdatedTo?.toISOString()}
          className="text-3xl sm:text-5xl font-mono font-bold tabular-nums text-white"
          verbose
        />
        <div className="mt-3 flex items-center justify-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: statusDotColors[clock.status] ?? "#C3BEA9" }}
          />
          <span className="text-velvet-100 text-sm">
            {statusLabels[clock.status] ?? clock.status}
          </span>
        </div>
      </div>

      <h1 className="text-2xl font-bold mt-6 text-ink">{clock.subjectLine}</h1>

      {/* Details card */}
      <div className="mt-4 bg-stone rounded-xl border border-sand-300 p-5 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-sand-600">To</span>
          <Link
            href={`/recipient/${encodeURIComponent(clock.recipientEmail)}`}
            className="font-mono text-sm text-ink hover:text-velvet-500 transition-colors"
          >
            {clock.recipientEmail}
          </Link>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-sand-600">Campaign</span>
          <Link
            href={`/campaign/${clock.campaign.identifier}`}
            className="font-medium text-ink hover:text-velvet-500 transition-colors"
          >
            {clock.campaign.name}
          </Link>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-sand-600">Started</span>
          <span className="text-ink">
            {clock.startedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Timeline */}
      {clock.statusHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-sand-600 uppercase tracking-wide mb-4">
            History
          </h2>
          <div className="space-y-0">
            {clock.statusHistory.map((event: StatusEvent) => (
              <div
                key={event.id}
                className="flex gap-4 text-sm border-l-2 border-velvet-300 pl-4 py-2"
              >
                <span className="text-bronze font-medium whitespace-nowrap">
                  {event.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-sand-700">
                  {event.note ?? statusLabels[event.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
