import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import { BRAND } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: `${BRAND.productName} | ${BRAND.masterBrandName}`,
    template: `%s | ${BRAND.productName}`,
  },
  description: BRAND.positioningEn,
  keywords: ["Subscription", "VPN", "B2C", "Telegram Support", "ASDEV", "NexaVPN"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: `${BRAND.productName} | ${BRAND.masterBrandName}`,
    description: BRAND.positioningEn,
    url: BRAND.siteUrl,
    siteName: `${BRAND.productName} by ${BRAND.masterBrandName}`,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
