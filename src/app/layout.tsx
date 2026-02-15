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
  title: "Jewellery Showcase",
  description: "Premium jewellery collection - Shop and order via WhatsApp",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Jewellery Showcase',
    description: 'Premium jewellery collection - Shop and order via WhatsApp',
    url: '/',
    siteName: 'Jewellery Showcase',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        alt: 'Jewellery Showcase',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jewellery Showcase',
    description: 'Premium jewellery collection - Shop and order via WhatsApp',
    images: ['/logo.png'],
  },
};

// Make Next.js resolve relative metadata URLs against this base when needed
export const metadataBase = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined;

import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
