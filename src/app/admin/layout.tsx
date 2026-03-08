import Link from "next/link";
import { getAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdmin();

  if (!admin.authenticated) {
    return (
      <div className="min-h-screen bg-stone flex items-center justify-center">
        <div className="bg-white border border-sand-300 rounded-lg p-8 w-full max-w-sm">
          <h1 className="font-mono font-bold text-velvet-500 text-xl mb-6">
            clock.email admin
          </h1>
          <form action="/api/admin/login" method="POST">
            <label className="block text-sm font-medium text-sand-700 mb-2">
              Admin token
            </label>
            <input
              type="password"
              name="token"
              required
              className="w-full border border-sand-300 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-velvet-300"
              placeholder="Enter admin token"
            />
            <button
              type="submit"
              className="w-full bg-velvet-500 text-white font-medium py-2 rounded-md hover:bg-velvet-600 transition-colors text-sm"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone">
      <nav className="border-b border-sand-300 bg-velvet-700">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-mono font-bold text-white text-lg">
              clock.email <span className="text-velvet-100 font-normal text-sm">admin</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/admin/review" className="text-velvet-100 hover:text-white text-sm transition-colors">
                Review
              </Link>
              <Link href="/admin/domains" className="text-velvet-100 hover:text-white text-sm transition-colors">
                Domains
              </Link>
              <Link href="/admin/clocks" className="text-velvet-100 hover:text-white text-sm transition-colors">
                Clocks
              </Link>
              <Link href="/admin/campaigns" className="text-velvet-100 hover:text-white text-sm transition-colors">
                Campaigns
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-velvet-200 text-sm">{admin.name}</span>
            <Link href="/" className="text-velvet-100 hover:text-white text-sm transition-colors">
              Back to site
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button type="submit" className="text-velvet-100 hover:text-white text-sm transition-colors">
                Log out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
