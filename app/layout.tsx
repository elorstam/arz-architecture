import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import LocalePreference from "@/components/LocalePreference";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const siteUrl = "https://arzmimarlik.net";

const themeScript = `
  try {
    const stored = localStorage.getItem("arz-theme");
    const theme = stored === "light" || stored === "dark"
      ? stored
      : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = "dark";
  }
`;


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "ARZ Mimarlık | Mimarlık ve İç Mimarlık",
    template: "%s | ARZ Mimarlık",
  },

  description:
    "ARZ Mimarlık; mimari proje, iç mimarlık, uygulama, proje geliştirme ve danışmanlık hizmetleri sunan İstanbul merkezli mimarlık ofisidir.",

  keywords: [
    "ARZ Mimarlık",
    "mimarlık",
    "mimarlık ofisi",
    "iç mimarlık",
    "mimari proje",
    "iç mimari tasarım",
    "villa tasarımı",
    "konut projesi",
    "cephe tasarımı",
    "uygulama projesi",
    "mimari danışmanlık",
    "Sancaktepe mimarlık",
    "İstanbul mimarlık ofisi",
  ],

  authors: [
    {
      name: "ARZ Mimarlık",
      url: siteUrl,
    },
  ],

  creator: "ARZ Mimarlık",
  publisher: "ARZ Mimarlık",
  applicationName: "ARZ Mimarlık",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "ARZ Mimarlık",
    title: "ARZ Mimarlık | Mimarlık ve İç Mimarlık",
    description:
      "Mimari proje, iç mimarlık, uygulama, proje geliştirme ve danışmanlık hizmetleri.",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "ARZ Mimarlık",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ARZ Mimarlık | Mimarlık ve İç Mimarlık",
    description:
      "Mimari proje, iç mimarlık, uygulama, proje geliştirme ve danışmanlık hizmetleri.",
    images: ["/opengraph-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
      },
    ],
  },

  category: "architecture",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteUrl}/#organization`,
  name: "ARZ Mimarlık",
  url: siteUrl,
  logo: `${siteUrl}/arz-logo-final.png`,
  image: `${siteUrl}/opengraph-image.jpg`,
  description:
    "Mimari proje, iç mimarlık, uygulama, proje geliştirme ve danışmanlık hizmetleri sunan İstanbul merkezli mimarlık ofisi.",
  telephone: "+90 542 570 44 29",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Abdurrahmangazi Mahallesi, Betül Sokak, Tuna İş Merkezi No: 2/4",
    addressLocality: "Sancaktepe",
    addressRegion: "İstanbul",
    addressCountry: "TR",
  },
  areaServed: {
    "@type": "Country",
    name: "Türkiye",
  },
  sameAs: [
    "https://www.instagram.com/arzmimarliknet/",
    "https://www.linkedin.com/company/90222590",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+90 542 570 44 29",
    contactType: "customer service",
    areaServed: "TR",
    availableLanguage: ["Turkish"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{__html: themeScript}} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        <NextIntlClientProvider messages={messages}>
          <ScrollToTop />
          <LocalePreference />
          <Navbar />

          <main>{children}</main>
        </NextIntlClientProvider>

        <GoogleAnalytics gaId="G-7EMGB9PSVS" />
      </body>
    </html>
  );
}
