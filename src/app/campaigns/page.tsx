export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { StatusDots } from "@/components/status-dots";
import { TickingClock } from "@/components/ticking-clock";
import { CampaignSearch } from "@/components/campaign-search";
import Link from "next/link";
import type { Clock, Campaign } from "@/generated/prisma";

export const metadata = {
  title: "All Campaigns — clock.email",
};

type CampaignWithClocks = Campaign & {
  clocks: Pick<Clock, "status" | "startedAt" | "resolvedAt" | "resolutionBackdatedTo">[];
  _count: { clocks: number };
};

type SortOption = "newest" | "oldest" | "most-clocks" | "most-active";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { sort, q } = await searchParams;
  const sortBy = (sort ?? "newest") as SortOption;

  const campaigns = await prisma.campaign.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
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
    orderBy:
      sortBy === "oldest"
        ? { createdAt: "asc" }
        : sortBy === "most-clocks"
          ? { clocks: { _count: "desc" } }
          : { createdAt: "desc" },
  }) as CampaignWithClocks[];

  // For "most-active" we need to sort in JS since it depends on clock status
  const sorted =
    sortBy === "most-active"
      ? [...campaigns].sort((a, b) => {
          const aActive = a.clocks.filter((c) => c.status !== "resolved" && c.status !== "inactive").length;
          const bActive = b.clocks.filter((c) => c.status !== "resolved" && c.status !== "inactive").length;
          return bActive - aActive;
        })
      : campaigns;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-ink">All Campaigns</h1>

      {/* Search and sort controls */}
      <CampaignSearch currentSort={sortBy} currentQuery={q ?? ""} />

      {/* Results */}
      <div className="mt-6">
        {sorted.length === 0 ? (
          <div className="bg-stone rounded-xl border border-sand-300 p-8 text-center">
            <p className="text-warmgray">
              {q ? `No campaigns matching "${q}".` : "No campaigns yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sorted.map((campaign) => {
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

        <p className="text-xs text-warmgray mt-4 text-center">
          {sorted.length} campaign{sorted.length !== 1 ? "s" : ""}
        </p>
      </div>
    </main>
  );
}
