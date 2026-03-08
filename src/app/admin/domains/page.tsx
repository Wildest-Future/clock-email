import { prisma } from "@/lib/db";
import { addDomain, updateDomainStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function DomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const statusFilter = params.status ?? "all";

  const where: Record<string, unknown> = {};
  if (query) {
    where.domain = { contains: query, mode: "insensitive" };
  }
  if (statusFilter !== "all") {
    where.status = statusFilter;
  }

  const domains = await prisma.domain.findMany({
    where,
    orderBy: { addedAt: "desc" },
  });

  // Get clock counts per domain
  const clockCounts = await prisma.clock.groupBy({
    by: ["recipientEmail"],
    _count: true,
  });

  const domainClockCounts: Record<string, number> = {};
  for (const row of clockCounts) {
    const d = row.recipientEmail.split("@")[1]?.toLowerCase();
    if (d) {
      domainClockCounts[d] = (domainClockCounts[d] ?? 0) + row._count;
    }
  }

  const statusColors: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    blocked: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  const tabs = ["all", "approved", "blocked", "pending"];

  return (
    <div>
      <h1 className="font-mono font-bold text-2xl text-velvet-700 mb-6">Domains</h1>

      {/* Add domain form */}
      <form action={addDomain} className="bg-stone border border-sand-300 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-sand-700 mb-3">Add domain</p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            name="domain"
            required
            placeholder="example.gov"
            className="border border-sand-300 rounded-md px-3 py-1.5 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-velvet-300"
          />
          <select
            name="status"
            className="border border-sand-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-velvet-300"
          >
            <option value="approved">Approved</option>
            <option value="blocked">Blocked</option>
            <option value="pending">Pending</option>
          </select>
          <input
            type="text"
            name="reason"
            placeholder="Reason (optional)"
            className="border border-sand-300 rounded-md px-3 py-1.5 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-velvet-300"
          />
          <button
            type="submit"
            className="bg-velvet-500 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-velvet-600 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-4 mb-4 items-center flex-wrap">
        <form className="flex-1 min-w-48">
          <input type="hidden" name="status" value={statusFilter} />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search domains..."
            className="w-full border border-sand-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-velvet-300"
          />
        </form>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <a
              key={tab}
              href={`/admin/domains?status=${tab}${query ? `&q=${query}` : ""}`}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === tab
                  ? "bg-velvet-500 text-white"
                  : "bg-stone border border-sand-300 text-sand-700 hover:border-velvet-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </a>
          ))}
        </div>
      </div>

      {/* Domain table */}
      <div className="bg-stone border border-sand-300 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand-100 text-sand-600 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Domain</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Clocks</th>
              <th className="px-4 py-2 font-medium">Added</th>
              <th className="px-4 py-2 font-medium">Reviewed by</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {domains.map((d) => (
              <tr key={d.domain} className="hover:bg-sand-50">
                <td className="px-4 py-2 font-mono">{d.domain}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[d.status]}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-2">{domainClockCounts[d.domain] ?? 0}</td>
                <td className="px-4 py-2 text-sand-600">{d.addedAt.toLocaleDateString()}</td>
                <td className="px-4 py-2 text-sand-600">{d.reviewedBy ?? "—"}</td>
                <td className="px-4 py-2">
                  <form action={updateDomainStatus} className="flex gap-1">
                    <input type="hidden" name="domain" value={d.domain} />
                    <input type="hidden" name="reason" value={`Status changed from ${d.status}`} />
                    {d.status !== "approved" && (
                      <button
                        type="submit"
                        name="status"
                        value="approved"
                        className="text-green-600 hover:text-green-800 text-xs font-medium"
                      >
                        Approve
                      </button>
                    )}
                    {d.status !== "blocked" && (
                      <button
                        type="submit"
                        name="status"
                        value="blocked"
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Block
                      </button>
                    )}
                    {d.status !== "pending" && (
                      <button
                        type="submit"
                        name="status"
                        value="pending"
                        className="text-yellow-600 hover:text-yellow-800 text-xs font-medium"
                      >
                        Pending
                      </button>
                    )}
                  </form>
                </td>
              </tr>
            ))}
            {domains.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sand-500">
                  No domains found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-sand-500 mt-2">{domains.length} domain{domains.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
