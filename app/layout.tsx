import type { Metadata } from "next";
import "./globals.css";
import Providers from './providers';
import StructuredData from './structured-data';
import PreconnectLinks from './preconnect-links';

export const metadata: Metadata = {
  metadataBase: new URL('https://tasselandwicker.com'),
  title: {
    default: "Tassel & Wicker | Wicker Gift Baskets & Lifestyle Essentials",
    template: "%s | Tassel & Wicker"
  },
  description: "Discover thoughtfully curated wicker baskets and lifestyle essentials at Tassel & Wicker. Quality, aspirational, and timeless pieces for elevated living. Build your custom basket or shop our curated collection.",
  keywords: [
    "wicker baskets",
    "luxury baskets",
    "lifestyle essentials",
    "home decor",
    "gift baskets",
    "custom baskets",
    "curated lifestyle",
    "quality home items",
    "aspirational living",
    "timeless design",
    "Tassel & Wicker",
    "artisan baskets",
    "handcrafted baskets",
    "sustainable home products"
  ],
  authors: [{ name: "Tassel & Wicker" }],
  creator: "Tassel & Wicker",
  publisher: "Tassel & Wicker",
  applicationName: "Tassel & Wicker",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_GB"],
    url: "https://tasselandwicker.com",
    siteName: "Tassel & Wicker",
    title: "Tassel & Wicker | Wicker Gift Baskets & Lifestyle Essentials",
    description: "Discover thoughtfully curated wicker baskets and lifestyle essentials. Quality, aspirational, and timeless pieces for elevated living.",
    images: [
      {
        url: "https://tasselandwicker.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tassel & Wicker - Wicker Gift Baskets & Lifestyle Essentials",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@tasselandwicker",
    creator: "@tasselandwicker",
    title: "Tassel & Wicker | Wicker Gift Baskets & Lifestyle Essentials",
    description: "Discover thoughtfully curated wicker baskets and lifestyle essentials. Quality, aspirational, and timeless pieces for elevated living.",
    images: ["https://tasselandwicker.com/twitter-card.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Tassel & Wicker",
    "theme-color": "#4c062c",
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
    "rating": "general",
    "referrer": "no-referrer-when-downgrade",
    "geo.region": "US",
    "geo.placename": "United States",
    "language": "English",
  },
  alternates: {
    canonical: "https://tasselandwicker.com",
    types: {
      "application/rss+xml": [{ url: "https://tasselandwicker.com/feed.xml", title: "Tassel & Wicker RSS Feed" }],
      "application/xml": [{ url: "https://tasselandwicker.com/sitemap.xml", title: "Sitemap" }],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <PreconnectLinks />
        <StructuredData />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
