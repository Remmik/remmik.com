import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Remmik",
  description:
    "Remmik — Danish consultancy by Allan Kimmer Jensen. CVR 39483882.",
  metadataBase: new URL("https://remmik.com"),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Remmik",
    description:
      "Danish consultancy by Allan Kimmer Jensen. CVR 39483882.",
    url: "https://remmik.com",
    siteName: "Remmik",
    type: "website",
    locale: "da_DK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remmik",
    description:
      "Danish consultancy by Allan Kimmer Jensen. CVR 39483882.",
  },
  other: {
    "theme-color": "#0000FF",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Remmik",
    url: "https://remmik.com",
    telephone: "+4531585080",
    identifier: {
      "@type": "PropertyValue",
      name: "CVR",
      value: "39483882",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Remmik",
    url: "https://remmik.com",
  },
  {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Remmik",
    url: "https://remmik.com#contact",
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
