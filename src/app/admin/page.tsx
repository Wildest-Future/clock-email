import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [activeClocks, totalClocks, resolvedClocks, totalCampaigns, pendingDomains, totalDomains] =
    await Promise.all([
      prisma.clock.count({ where: { hidden: false, status: { notIn: ["resolved", "inactive"] } } }),
      prisma.clock.count(),
      prisma.clock.count({ where: { status: "resolved" } }),
      prisma.campaign.count(),
      prisma.domain.count({ where: { status: "pending" } }),
      prisma.domain.count(),
    ]);

  const stats = [
    { label: "Active clocks", value: activeClocks, href: "/admin/clocks" },
    { label: "Total campaigns", value: totalCampaigns, href: "/admin/campaigns" },
    { label: "Pending review", value: pendingDomains, href: "/admin/review", highlight: pendingDomains > 0 },
    { label: "Resolved clocks", value: resolvedClocks, href: "/admin/clocks" },
    { label: "Total clocks", value: totalClocks, href: "/admin/clocks" },
    { label: "Total domains", value: totalDomains, href: "/admin/domains" },
  ];

  return (
    <div>
      <h1 className="font-mono font-bold text-2xl text-velvet-700 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`bg-stone border rounded-lg p-5 hover:border-velvet-300 transition-colors ${
              stat.highlight ? "border-orange-400 bg-orange-50" : "border-sand-300"
            }`}
          >
            <div className={`text-3xl font-mono font-bold ${stat.highlight ? "text-orange-600" : "text-velvet-700"}`}>
              {stat.value}
            </div>
            <div className="text-sm text-sand-600 mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/admin/review"
          className="bg-stone border border-sand-300 rounded-lg p-5 hover:border-velvet-300 transition-colors"
        >
          <h2 className="font-mono font-bold text-velvet-700 mb-1">Review Queue</h2>
          <p className="text-sm text-sand-600">Pending domains and flagged content</p>
        </Link>
        <Link
          href="/admin/domains"
          className="bg-stone border border-sand-300 rounded-lg p-5 hover:border-velvet-300 transition-colors"
        >
          <h2 className="font-mono font-bold text-velvet-700 mb-1">Domain Management</h2>
          <p className="text-sm text-sand-600">View, search, and manage all domains</p>
        </Link>
      </div>
    </div>
  );
}
