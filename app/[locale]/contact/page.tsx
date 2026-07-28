import type {Metadata} from "next";
import ContactPage from "@/components/ContactPage";

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const en = locale !== "tr";
  return {
    title: en ? "Contact" : "İletişim",
    description: en
      ? "Contact ARZ Architecture for architectural design, interior architecture, project and consultancy services."
      : "ARZ Mimarlık ile mimari tasarım, iç mimarlık, proje ve danışmanlık hizmetleri için iletişime geçin.",
    openGraph: {type: "website", locale: en ? "en_US" : "tr_TR"},
    twitter: {card: "summary_large_image"},
    alternates: {canonical: `/${locale}/${en ? "contact" : "iletisim"}`, languages: {tr: "/tr/iletisim", en: "/en/contact"}},
  };
}

export default function ContactRoute() { return <ContactPage />; }
