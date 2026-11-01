import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { siteConfig } from "@/config/site";
import { images } from "@/config/images";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Shore Nails | Nail Salon in Northfield, NJ",
    template: "%s | Shore Nails",
  },
  description: siteConfig.description,
  keywords: [
    "Shore Nails",
    "nail salon Northfield NJ",
    "nails Northfield New Jersey",
    "manicure Northfield",
    "pedicure Northfield NJ",
    "gel nails",
    "acrylic nails",
    "dipping powder",
    "waxing Northfield NJ",
    "spa pedicure",
    "nail enhancements",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: "Shore Nails | Nail Salon in Northfield, NJ",
    description: siteConfig.description,
    images: [{ url: images.hero.src, alt: images.hero.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shore Nails | Nail Salon in Northfield, NJ",
    description: siteConfig.description,
    images: [images.hero.src],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#EEE9E2",
  width: "device-width",
  initialScale: 1,
};

// JSON-LD Structured Data for LocalBusiness / NailSalon
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NailSalon",
  name: siteConfig.name,
  image: `${siteConfig.url}${images.hero.src}`,
  telephone: siteConfig.contact.phoneDisplay,
  url: siteConfig.url,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.contact.address.street,
    addressLocality: siteConfig.contact.address.city,
    addressRegion: siteConfig.contact.address.stateAbbr,
    postalCode: siteConfig.contact.address.zip,
    addressCountry: "US",
  },
  hasMap: siteConfig.contact.googleMapsUrl,
  sameAs: [
    siteConfig.social.facebook.url,
    siteConfig.social.instagram.url,
  ],
  priceRange: "$$",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-ivory text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
