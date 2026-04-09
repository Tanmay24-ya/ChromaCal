import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChromaCal — Interactive Wall Calendar",
  description: "A premium interactive wall calendar with mood tracking, range selection, trip planning, and cinematic monthly views.",
  keywords: "calendar, planner, mood tracker, trip planner, interactive calendar",
  openGraph: {
    title: "ChromaCal — Interactive Wall Calendar",
    description: "Premium interactive calendar with mood tracking and trip planning",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
