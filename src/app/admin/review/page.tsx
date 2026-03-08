import { prisma } from "@/lib/db";
import { approveDomain, blockDomain } from "../actions";

export const dynamic = "force-dynamic";

export default async function ReviewQueue() {
  const pendingDomains = await prisma.domain.findMany({
    where: { status: "pending" },
    orderBy: { addedAt: "asc" },
  });

  // Get clock counts and recipient details per pending domain
  const domainDetails = await Promise.all(
    pendingDomains.map(async (d) => {
      const clocks = await prisma.clock.findMany({
        where: { recipientEmail: { endsWith: `@${d.domain}` } },
        select: {
          recipientEmail: true,
          subjectLine: true,
          hidden: true,
          senderEmail: true,
        },
      });

      const recipients = [...new Set(clocks.map((c) => c.recipientEmail))];
      const hiddenCount = clocks.filter((c) => c.hidden).length;

      return {
        ...d,
        clockCount: clocks.length,
        hiddenCount,
        recipients,
        subjects: clocks.slice(0, 5).map((c) => c.subjectLine),
      };
    })
  );

  return (
    <div>
      <h1 className="font-mono font-bold text-2xl text-velvet-700 mb-6">Review Queue</h1>

      {domainDetails.length === 0 ? (
        <div className="bg-stone border border-sand-300 rounded-lg p-8 text-center">
          <p className="text-sand-600">Nothing to review. All clear.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {domainDetails.map((d) => (
            <div key={d.domain} className="bg-stone border border-sand-300 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-mono font-bold text-lg text-velvet-700">{d.domain}</h2>
                  <p className="text-sm text-sand-600">
                    {d.clockCount} clock{d.clockCount !== 1 ? "s" : ""}
                    {d.hiddenCount > 0 && (
                      <span className="text-orange-600"> ({d.hiddenCount} hidden by flags)</span>
                    )}
                    {" · "}First seen {d.addedAt.toLocaleDateString()}
                    {d.submittedBy && d.submittedBy !== "system" && (
                      <span> · Triggered by {d.submittedBy}</span>
                    )}
                  </p>
                </div>
              </div>

              {d.recipients.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-sand-500 uppercase tracking-wide mb-1">Recipients</p>
                  <div className="flex flex-wrap gap-1">
                    {d.recipients.map((r) => (
                      <span key={r} className="font-mono text-xs bg-sand-100 text-sand-700 px-2 py-0.5 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {d.subjects.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-sand-500 uppercase tracking-wide mb-1">Subject lines</p>
                  <ul className="text-sm text-sand-700 space-y-0.5">
                    {d.subjects.map((s, i) => (
                      <li key={i} className="truncate">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <form action={approveDomain}>
                  <input type="hidden" name="domain" value={d.domain} />
                  <input type="hidden" name="reason" value="Approved via review queue" />
                  <button
                    type="submit"
                    className="bg-green-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </form>
                <form action={blockDomain} className="flex gap-2">
                  <input type="hidden" name="domain" value={d.domain} />
                  <input
                    type="text"
                    name="reason"
                    required
                    placeholder="Reason for blocking..."
                    className="border border-sand-300 rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <button
                    type="submit"
                    className="bg-red-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Block
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
