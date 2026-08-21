import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/navbar/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StaySpot — Discover & Book Boutique Stays & Luxury Villas",
  description:
    "Find curated hotel rooms, boutique stays, villas, and apartments with instant booking and flexible amenities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-slate-950 text-slate-100"
        suppressHydrationWarning
      >
        <ClerkProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
        </ClerkProvider>
      </body>
    </html>
  );
}
