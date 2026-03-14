import type { Metadata, Viewport } from "next";
import { Literata } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// ... (imports)

export const viewport: Viewport = {
  themeColor: "#C2410C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Navkar Siddhi — Jain Mantra Meditation & Tap Tracking",
  description: "A spiritually aligned Navkar mantra meditation and tap-tracking app for Jain sadhana. Count malas, track streaks, and deepen your jaap practice.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Navkar Siddhi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${literata.variable} font-body antialiased`}
      >
        <ServiceWorkerRegister />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
