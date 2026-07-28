import type {Metadata} from "next";
import AboutPage from "@/components/AboutPage";

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const en = locale === "en";
  return {
    title: en ? "About" : "Hakkımızda",
    description: en
      ? "ARZ Architecture is an Istanbul-based architecture and interior design studio founded in February 2023."
      : "ARZ Mimarlık, Şubat 2023'te İstanbul'da kurulan mimarlık ve iç mimarlık ofisidir.",
    openGraph: {type: "website", locale: en ? "en_US" : "tr_TR"},
    twitter: {card: "summary_large_image"},
    alternates: {canonical: `/${locale}/${en ? "about" : "hakkimizda"}`, languages: {tr: "/tr/hakkimizda", en: "/en/about"}},
  };
}

export default function AboutRoute() { return <AboutPage />; }
