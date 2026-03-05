import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ClockRow } from "@/components/clock-row";
import { SendEmailButton } from "@/components/send-email-button";
import { TickingClock } from "@/components/ticking-clock";
import type { Clock, CampaignTarget } from "@/generated/prisma";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  const { identifier } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { identifier },
    include: {
      targets: true,
      clocks: {
        orderBy: { startedAt: "asc" },
      },
    },
  });

  if (!campaign) notFound();

  const ccAddress = `start+${campaign.identifier}@clock.email`;
  const activeClocks = campaign.clocks.filter(
    (c: Clock) => c.status !== "resolved" && c.status !== "inactive"
  );
  const resolvedClocks = campaign.clocks.filter((c: Clock) => c.status === "resolved");

  // Oldest active clock — the one that's been waiting longest
  const oldestActiveClock = activeClocks[0];

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-sand-600 hover:text-bronze transition-colors">
        &larr; All campaigns
      </Link>

      {/* Campaign header */}
      <div className="mt-4 bg-velvet-700 rounded-xl px-5 sm:px-8 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{campaign.name}</h1>
        {campaign.description && (
          <p className="text-velvet-100 mt-2">{campaign.description}</p>
        )}

        {oldestActiveClock && (
          <div className="mt-5 pt-5 border-t border-velvet-500">
            <p className="text-xs text-velvet-100 uppercase tracking-wide mb-2">
              Waiting for a response from{" "}
              <span className="text-white font-medium normal-case">
                {oldestActiveClock.recipientEmail}
              </span>{" "}
              for
            </p>
            <TickingClock
              startedAt={oldestActiveClock.startedAt.toISOString()}
              resolvedAt={oldestActiveClock.resolvedAt?.toISOString()}
              resolutionBackdatedTo={oldestActiveClock.resolutionBackdatedTo?.toISOString()}
              className="text-3xl sm:text-5xl font-mono font-bold tabular-nums text-white"
              verbose
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
        <div className="bg-paper rounded-lg border border-sand-300 px-4 py-3 text-center">
          <span className="text-xl sm:text-2xl font-bold text-oxide block">{activeClocks.length}</span>
          <span className="text-xs text-sand-600">active</span>
        </div>
        <div className="bg-paper rounded-lg border border-sand-300 px-4 py-3 text-center">
          <span className="text-xl sm:text-2xl font-bold text-ok block">{resolvedClocks.length}</span>
          <span className="text-xs text-sand-600">resolved</span>
        </div>
        <div className="bg-paper rounded-lg border border-sand-300 px-4 py-3 text-center">
          <span className="text-xl sm:text-2xl font-bold text-ink block">{campaign.clocks.length}</span>
          <span className="text-xs text-sand-600">total</span>
        </div>
      </div>

      {/* Send your email */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-sand-600 uppercase tracking-wide mb-3">
          Join this campaign
        </h2>
        <div className="bg-stone rounded-xl border border-sand-300 p-5">
          <p className="text-sm text-sand-700 mb-4">
            Send an email to one of the recipients below. The clock.email CC
            address is added automatically.
          </p>

          {campaign.emailTemplate && (
            <div className="mb-4 bg-paper rounded-lg border border-sand-300 p-4">
              <p className="text-xs font-semibold text-sand-600 uppercase tracking-wide mb-2">
                Suggested email
              </p>
              <p className="text-sm text-sand-700 whitespace-pre-line">
                {campaign.emailTemplate}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {campaign.targets.map((recipient: CampaignTarget) => (
              <SendEmailButton
                key={recipient.id}
                targetEmail={recipient.email}
                ccAddress={ccAddress}
                subject={campaign.suggestedSubject ?? ""}
              />
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-sand-300">
            <p className="text-xs text-warmgray">
              Or manually CC{" "}
              <span className="font-mono text-velvet-500">{ccAddress}</span>{" "}
              on any email to a recipient above.
            </p>
          </div>
        </div>
      </div>

      {/* Clocks */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-sand-600 uppercase tracking-wide mb-3">
          Clocks
        </h2>
        <div className="bg-paper rounded-xl border border-sand-300 overflow-hidden">
          {campaign.clocks.length === 0 ? (
            <p className="text-warmgray text-center py-12">
              No clocks in this campaign yet. Be the first to send an email.
            </p>
          ) : (
            <div className="divide-y divide-sand-300">
              {campaign.clocks.map((clock: Clock) => (
                <ClockRow
                  key={clock.id}
                  id={clock.id}
                  subjectLine={clock.subjectLine}
                  status={clock.status}
                  startedAt={clock.startedAt.toISOString()}
                  resolvedAt={clock.resolvedAt?.toISOString()}
                  resolutionBackdatedTo={clock.resolutionBackdatedTo?.toISOString()}
                  recipientEmail={clock.recipientEmail}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
