import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://clock.email";

export const metadata: Metadata = {
  title: {
    default: "clock.email — Government Response Time, Made Visible",
    template: "%s — clock.email",
  },
  description:
    "A civic accountability tool that makes government response time publicly visible. CC start@clock.email when you email a government official, and a public timer starts counting.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "clock.email",
    title: "clock.email — Government Response Time, Made Visible",
    description:
      "When you email a government official and CC clock.email, a public timer starts. It stops when they respond.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plexMono.variable} ${plexSans.variable} antialiased min-h-screen flex flex-col`}
      >
        {process.env.DEMO_MODE === "true" && (
          <div className="bg-velvet-700 text-white text-center text-sm py-2 px-4">
            This is a demo site with sample data.{" "}
            <a href="https://clock.email" className="underline hover:text-velvet-100">
              Go to the real site &rarr;
            </a>
          </div>
        )}
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
