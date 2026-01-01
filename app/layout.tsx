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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://keychain-generator.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "3D Keychain & License Plate Generator - Free STL Creator",
    template: "%s | 3D Keychain Generator",
  },
  description: "Create custom 3D printable keychains and mini license plates with personalized text, icons, and styles. Free STL & 3MF file generator for 3D printing.",
  keywords: [
    "3D keychain generator",
    "custom keychain maker",
    "STL file generator",
    "3MF generator",
    "3D printable keychain",
    "license plate keychain",
    "EU license plate",
    "personalized keychain",
    "free 3D print files",
    "custom name keychain",
  ],
  authors: [{ name: "Keychain Generator" }],
  creator: "Keychain Generator",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "3D Keychain Generator",
    title: "3D Keychain & License Plate Generator - Free STL Creator",
    description: "Create custom 3D printable keychains and mini license plates. Free STL & 3MF files for 3D printing.",
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Keychain & License Plate Generator",
    description: "Create custom 3D printable keychains and mini license plates. Free STL files.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "3D Keychain Generator",
  "description": "Create custom 3D printable keychains and mini license plates with personalized text, icons, and styles.",
  "url": baseUrl,
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Custom text and fonts",
    "Multiple keychain shapes",
    "EU license plate styles",
    "STL file export",
    "3MF file export",
    "Real-time 3D preview"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
