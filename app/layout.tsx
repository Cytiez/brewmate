import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { fraunces, geistSans, geistMono } from "./fonts";
import ThemeProvider from "@/components/ThemeProvider";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Brewmate — a quiet brew journal",
    template: "%s · Brewmate",
  },
  description: "A quiet brew journal for home coffee. Log the variables. Read the patterns. Dial it in.",
  manifest: "/manifest.json",
  applicationName: "Brewmate",
  appleWebApp: { capable: true, title: "Brewmate", statusBarStyle: "default" },
  openGraph: {
    title: "Brewmate — a quiet brew journal",
    description: "Log your home brews, track variables, and get AI tasting feedback. Built for the way home brewers actually brew.",
    url: siteUrl,
    siteName: "Brewmate",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brewmate — a quiet brew journal",
    description: "Log your home brews, track variables, dial in your recipe.",
  },
  alternates: { canonical: siteUrl },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F1E7" },
    { media: "(prefers-color-scheme: dark)", color: "#15110D" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh font-sans antialiased">
        <ThemeProvider>
          <div className="min-h-dvh relative-z">{children}</div>
          <Toaster
            position="top-center"
            toastOptions={{
              classNames: {
                toast: "bg-elevated border-hairline border-rule-strong text-ink font-mono text-xs",
                title: "font-mono",
              },
            }}
          />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
