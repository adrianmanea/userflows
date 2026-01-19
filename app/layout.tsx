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

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "PageInspo - UI Pattern Library for UX/UI Research",
    template: "%s | PageInspo",
  },
  description:
    "Explore interactive UI patterns and flows from top apps. Copy-ready code for login screens, onboarding flows, checkout processes, and more.",
  keywords: [
    "UI patterns",
    "design inspiration",
    "React components",
    "user flows",
    "mobile UI",
    "web design",
    "Tailwind CSS",
  ],
  authors: [{ name: "PageInspo" }],
  creator: "PageInspo",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://pageinspo.com",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PageInspo",
    title: "PageInspo - UI Pattern Library for UX/UI Research",
    description:
      "Explore interactive UI patterns and flows from top apps. Copy-ready code for your next project.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PageInspo - UI Pattern Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PageInspo - UI Pattern Library for UX/UI Research",
    description:
      "Explore interactive UI patterns and flows from top apps. Copy-ready code for your next project.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-muted antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
