import "server-only";

import { translationLocales } from "@/i18n/locales";
import {
  getSiteTranslations,
  saveSiteTranslation,
} from "@/lib/site-translation-store";
import { legalTranslationSource } from "@/lib/legal/legal-translation-source";

export async function seedLegalTranslations() {
  const existing = await getSiteTranslations();

  const existingByKey = new Map(
    existing.map((item) => [item.key, item]),
  );

  let created = 0;
  let updated = 0;

  for (const [key, sourceTr] of Object.entries(
    legalTranslationSource,
  )) {
    const current = existingByKey.get(key);

    if (!current) {
      await saveSiteTranslation({
        key,
        sourceTr,
        translations: {},
        staleLocales: [...translationLocales],
      });

      created += 1;
      continue;
    }

    if (current.sourceTr !== sourceTr) {
      await saveSiteTranslation({
        ...current,
        sourceTr,
        staleLocales: [...translationLocales],
      });

      updated += 1;
    }
  }

  return {
    created,
    updated,
    total: Object.keys(legalTranslationSource).length,
  };
}