import { prisma } from "@/lib/db";
import { hideClock, unhideClock, deleteClock } from "../actions";

export const dynamic = "force-dynamic";

export default async function ClocksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; hidden?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Math.max(1, Number(params.page ?? 1));
  const showHidden = params.hidden ?? "all";
  const pageSize = 50;

  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { subjectLine: { contains: query, mode: "insensitive" } },
      { senderEmail: { contains: query, mode: "insensitive" } },
      { recipientEmail: { contains: query, mode: "insensitive" } },
    ];
  }
  if (showHidden === "hidden") where.hidden = true;
  if (showHidden === "visible") where.hidden = false;

  const [clocks, total] = await Promise.all([
    prisma.clock.findMany({
      where,
      include: { campaign: { select: { name: true } } },
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.clock.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    response_received: "bg-yellow-100 text-yellow-700",
    disputed: "bg-red-100 text-red-700",
    resolved: "bg-blue-100 text-blue-700",
    inactive: "bg-sand-300 text-sand-700",
  };

  return (
    <div>
      <h1 className="font-mono font-bold text-2xl text-velvet-700 mb-6">Clocks</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4 items-center flex-wrap">
        <form className="flex-1 min-w-48">
          <input type="hidden" name="hidden" value={showHidden} />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by subject, sender, or recipient..."
            className="w-full border border-sand-300 rounded-md px-3 py-1.5 text-sm bg-stone focus:outline-none focus:ring-2 focus:ring-velvet-300"
          />
        </form>
        <div className="flex gap-1">
          {["all", "visible", "hidden"].map((tab) => (
            <a
              key={tab}
              href={`/admin/clocks?hidden=${tab}${query ? `&q=${query}` : ""}`}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                showHidden === tab
                  ? "bg-velvet-500 text-white"
                  : "bg-stone border border-sand-300 text-sand-700 hover:border-velvet-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </a>
          ))}
        </div>
      </div>

      {/* Clock cards */}
      {clocks.length === 0 ? (
        <div className="bg-stone border border-sand-300 rounded-lg p-8 text-center">
          <p className="text-sand-500">No clocks found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clocks.map((clock) => (
            <div
              key={clock.id}
              className={`border rounded-lg p-4 ${
                clock.hidden
                  ? "bg-red-50/50 border-red-200"
                  : "bg-stone border-sand-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink truncate">
                    {clock.hidden && (
                      <span className="text-red-500 text-xs mr-1">[hidden]</span>
                    )}
                    {clock.subjectLine}
                  </p>
                  <p className="text-sm text-sand-600 mt-0.5">{clock.campaign.name}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${statusColors[clock.status] ?? ""}`}>
                  {clock.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs text-sand-600 mb-3">
                <div>
                  <span className="text-sand-500">From: </span>
                  <span className="font-mono">{clock.senderEmail}</span>
                </div>
                <div>
                  <span className="text-sand-500">To: </span>
                  <span className="font-mono">{clock.recipientEmail}</span>
                </div>
                <div>
                  <span className="text-sand-500">Started: </span>
                  {clock.startedAt.toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-sand-200">
                {clock.hidden ? (
                  <form action={unhideClock}>
                    <input type="hidden" name="clockId" value={clock.id} />
                    <button type="submit" className="text-green-600 hover:text-green-800 text-xs font-medium">
                      Unhide
                    </button>
                  </form>
                ) : (
                  <form action={hideClock}>
                    <input type="hidden" name="clockId" value={clock.id} />
                    <input type="hidden" name="reason" value="admin_manual" />
                    <button type="submit" className="text-yellow-600 hover:text-yellow-800 text-xs font-medium">
                      Hide
                    </button>
                  </form>
                )}
                <form action={deleteClock}>
                  <input type="hidden" name="clockId" value={clock.id} />
                  <input type="hidden" name="reason" value="Deleted by admin" />
                  <button type="submit" className="text-red-600 hover:text-red-800 text-xs font-medium">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-sand-500">{total} clock{total !== 1 ? "s" : ""}</p>
        {totalPages > 1 && (
          <div className="flex gap-1">
            {page > 1 && (
              <a
                href={`/admin/clocks?page=${page - 1}${query ? `&q=${query}` : ""}${showHidden !== "all" ? `&hidden=${showHidden}` : ""}`}
                className="px-3 py-1 text-sm bg-stone border border-sand-300 rounded-md hover:border-velvet-300"
              >
                Prev
              </a>
            )}
            <span className="px-3 py-1 text-sm text-sand-600">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={`/admin/clocks?page=${page + 1}${query ? `&q=${query}` : ""}${showHidden !== "all" ? `&hidden=${showHidden}` : ""}`}
                className="px-3 py-1 text-sm bg-stone border border-sand-300 rounded-md hover:border-velvet-300"
              >
                Next
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
