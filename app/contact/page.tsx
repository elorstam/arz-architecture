import type { Metadata } from "next";
import ContactPage from "@/components/ContactPage";

export const metadata: Metadata = {
  title: "İletişim | ARZ Mimarlık",
  description:
    "ARZ Mimarlık ile mimari tasarım, iç mimarlık, proje ve danışmanlık hizmetleri için iletişime geçin.",
};

export default function ContactRoute() {
  return <ContactPage />;
}