import Link from "next/link";
import Image from "next/image";

export function Nav() {
  return (
    <nav className="border-b border-sand-300 bg-stone">
      <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-mono font-bold text-velvet-500 text-lg">
          <Image src="/header-logo.jpg" alt="" width={28} height={28} className="rounded-sm" />
          clock.email
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/campaigns/new"
            className="text-sm font-medium bg-velvet-500 text-white px-4 py-1.5 rounded-lg hover:bg-velvet-600 transition-colors"
          >
            Start a campaign
          </Link>
        </div>
      </div>
    </nav>
  );
}
