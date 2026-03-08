import { prisma } from "@/lib/db";
import { hideCampaign, unhideCampaign, deleteCampaign } from "../actions";

export const dynamic = "force-dynamic";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";

  const where: Record<string, unknown> = {};
  if (query) {
    where.name = { contains: query, mode: "insensitive" };
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    include: { _count: { select: { clocks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-mono font-bold text-2xl text-velvet-700 mb-6">Campaigns</h1>

      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search campaigns..."
          className="w-full max-w-md border border-sand-300 rounded-md px-3 py-1.5 text-sm bg-stone focus:outline-none focus:ring-2 focus:ring-velvet-300"
        />
      </form>

      {campaigns.length === 0 ? (
        <div className="bg-stone border border-sand-300 rounded-lg p-8 text-center">
          <p className="text-sand-500">No campaigns found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div
              key={c.identifier}
              className={`border rounded-lg p-4 ${
                c.hidden
                  ? "bg-red-50/50 border-red-200"
                  : "bg-stone border-sand-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">
                    {c.hidden && (
                      <span className="text-red-500 text-xs mr-1">[hidden]</span>
                    )}
                    {c.name}
                  </p>
                  <p className="font-mono text-xs text-sand-600 mt-0.5">{c.identifier}</p>
                </div>
                <span className="text-sm font-mono text-velvet-500 shrink-0">
                  {c._count.clocks} clock{c._count.clocks !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-sand-600 mb-3">
                <div>
                  <span className="text-sand-500">Created by: </span>
                  <span className="font-mono">{c.createdByEmail}</span>
                </div>
                <div>
                  <span className="text-sand-500">Created: </span>
                  {c.createdAt.toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-sand-200">
                {c.hidden ? (
                  <form action={unhideCampaign}>
                    <input type="hidden" name="identifier" value={c.identifier} />
                    <button type="submit" className="text-green-600 hover:text-green-800 text-xs font-medium">
                      Unhide
                    </button>
                  </form>
                ) : (
                  <form action={hideCampaign}>
                    <input type="hidden" name="identifier" value={c.identifier} />
                    <button type="submit" className="text-yellow-600 hover:text-yellow-800 text-xs font-medium">
                      Hide
                    </button>
                  </form>
                )}
                <form action={deleteCampaign}>
                  <input type="hidden" name="identifier" value={c.identifier} />
                  <button type="submit" className="text-red-600 hover:text-red-800 text-xs font-medium">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-sand-500 mt-4">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
