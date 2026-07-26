import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "ARZ Mimarlık",
    template: "%s | ARZ Mimarlık",
  },
  description:
    "ARZ Mimarlık; mimari tasarım, iç mimarlık, proje geliştirme ve danışmanlık hizmetleri sunar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${manrope.variable} ${manrope.className}`}>
        {children}
      </body>
    </html>
  );
}