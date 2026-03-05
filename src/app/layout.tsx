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

export const metadata: Metadata = {
  title: "clock.email — Government Response Time, Made Visible",
  description:
    "A civic accountability tool that makes government response time publicly visible. CC start@clock.email when you email a government official, and a public timer starts counting.",
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
