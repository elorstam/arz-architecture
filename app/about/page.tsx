import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "ARZ Mimarlık, Şubat 2023'te İstanbul'da kurulan mimarlık ve iç mimarlık ofisidir.",
};

export default function AboutRoute() {
  return <AboutPage />;
}