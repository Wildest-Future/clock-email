import { prisma } from "@/lib/db";
import { StatusDots } from "@/components/status-dots";
import { TickingClock } from "@/components/ticking-clock";
import Link from "next/link";
import type { Clock, Campaign } from "@/generated/prisma";

type CampaignWithClocks = Campaign & {
  clocks: Pick<Clock, "status" | "startedAt" | "resolvedAt" | "resolutionBackdatedTo">[];
  _count: { clocks: number };
};

export default async function HomePage() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      clocks: {
        select: {
          status: true,
          startedAt: true,
          resolvedAt: true,
          resolutionBackdatedTo: true,
        },
        orderBy: { startedAt: "asc" },
      },
      _count: { select: { clocks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCampaigns = campaigns.length;
  const featuredCampaigns = campaigns.slice(0, 3);

  const totalActive = campaigns.reduce(
    (sum, c) => sum + c.clocks.filter((cl) => cl.status !== "resolved" && cl.status !== "inactive").length,
    0,
  );
  const totalResolved = campaigns.reduce(
    (sum, c) => sum + c.clocks.filter((cl) => cl.status === "resolved").length,
    0,
  );

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight">
          Government response time,<br />made visible.
        </h1>
        <p className="text-sand-600 mt-3 text-lg">
          When you email a government official and CC clock.email, a public timer
          starts. It stops when they respond.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/campaigns/new"
            className="bg-velvet-500 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-velvet-600 transition-colors text-sm"
          >
            Start a campaign
          </Link>
          <Link
            href="#campaigns"
            className="bg-stone border border-sand-300 text-sand-700 font-medium px-5 py-2.5 rounded-lg hover:border-velvet-300 transition-colors text-sm"
          >
            See active campaigns
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 sm:gap-6 mt-10 pt-8 border-t border-sand-300">
        <div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-velvet-700">{totalActive}</span>
          <span className="text-sand-600 ml-2 text-sm">active clocks</span>
        </div>
        <span className="text-sand-300">|</span>
        <div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-ok">{totalResolved}</span>
          <span className="text-sand-600 ml-2 text-sm">resolved</span>
        </div>
      </div>

      {/* Campaigns */}
      <div className="mt-8" id="campaigns">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold text-sand-600 uppercase tracking-wide">
            Active Campaigns
          </h2>
          <Link
            href="/campaigns"
            className="text-sm text-velvet-500 hover:text-velvet-400 transition-colors font-medium"
          >
            View all{totalCampaigns > 3 ? ` ${totalCampaigns}` : ""} &rarr;
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-stone rounded-xl border border-sand-300 p-8 text-center">
            <p className="text-warmgray">
              No campaigns yet. Be the first to start one.
            </p>
            <Link
              href="/campaigns/new"
              className="inline-block mt-4 bg-velvet-500 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-velvet-600 transition-colors text-sm"
            >
              Start a campaign
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {featuredCampaigns.map((campaign: CampaignWithClocks) => {
              const activeClock = campaign.clocks.find(
                (cl) => cl.status !== "resolved" && cl.status !== "inactive",
              );

              return (
                <Link
                  key={campaign.identifier}
                  href={`/campaign/${campaign.identifier}`}
                  className="block bg-stone rounded-xl border border-sand-300 p-5 hover:border-velvet-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{campaign.name}</p>
                      {campaign.description && (
                        <p className="text-sm text-sand-600 mt-1 line-clamp-2">
                          {campaign.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-mono text-velvet-500 whitespace-nowrap shrink-0">
                      {campaign._count.clocks} clock{campaign._count.clocks !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {activeClock && (
                    <div className="mt-3">
                      <TickingClock
                        startedAt={activeClock.startedAt.toISOString()}
                        className="font-mono text-xl sm:text-2xl tabular-nums font-bold"
                        ageColor
                      />
                    </div>
                  )}

                  <StatusDots clocks={campaign.clocks} />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="mt-16 pt-8 border-t border-sand-300">
        <h2 className="text-sm font-semibold text-sand-600 uppercase tracking-wide mb-6">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <p className="font-mono text-2xl font-bold text-velvet-500">01</p>
            <p className="font-semibold text-ink mt-1">Start a campaign</p>
            <p className="text-sm text-sand-600 mt-1">
              Pick a cause and add the email addresses of the officials you want
              to hold accountable.
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-velvet-500">02</p>
            <p className="font-semibold text-ink mt-1">Send your email</p>
            <p className="text-sm text-sand-600 mt-1">
              Email the official and CC the campaign address. A public timer
              starts automatically.
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-velvet-500">03</p>
            <p className="font-semibold text-ink mt-1">Wait — publicly</p>
            <p className="text-sm text-sand-600 mt-1">
              The clock ticks until the official responds. Everyone can see how
              long it takes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
