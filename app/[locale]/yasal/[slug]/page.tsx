import { notFound } from "next/navigation";

import LegalPage from "@/components/legal/LegalPage";
import { locales } from "@/i18n/locales";
import {
  isLegalSlug,
  legalDocuments,
} from "@/lib/legal/legal-content";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { locale, slug } = await params;

  if (
    !locales.includes(
      locale as (typeof locales)[number],
    ) ||
    !isLegalSlug(slug)
  ) {
    notFound();
  }

  return (
    <LegalPage
      locale={locale}
      slug={slug}
      document={legalDocuments[slug]}
    />
  );
}