import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ECHO — Autonomous Meeting Workflow Agent",
  description:
    "ECHO joins your meetings, decides what needs to happen, and executes across HubSpot, Linear, Slack, and Gmail. By the time you leave the meeting, the work is done.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "ECHO — Autonomous Meeting Workflow Agent",
    description:
      "5 specialist agents that decide and execute, not just summarize. Every action auditable to the moment in audio that caused it.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 font-sans text-slate-100">
        {children}
      </body>
    </html>
  );
}
