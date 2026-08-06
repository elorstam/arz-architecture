import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import {
  isSupabaseConfigured,
  supabaseSelect,
  supabaseUpsert,
} from "@/lib/supabase-rest";
import type { SiteTranslation } from "@/types/cms";
import { siteCopy } from "@/data/site-copy";
import { translationLocales } from "@/i18n/locales";

type Row = {
  key: string;
  source_tr: string;
  translations: Record<string, string>;
  stale_locales: string[];
  updated_at?: string;
};

const file = path.join(process.cwd(), "data", "site-translations.json");

const fromRow = (row: Row): SiteTranslation => ({
  key: row.key,
  sourceTr: row.source_tr,
  translations: row.translations || {},
  staleLocales: row.stale_locales || [],
  updatedAt: row.updated_at,
});

async function read() {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as SiteTranslation[];
  } catch {
    return [];
  }
}

export async function getSiteTranslations() {
  if (isSupabaseConfigured()) {
    return (
      await supabaseSelect<Row>(
        "site_translations",
        "select=*&order=key.asc",
      )
    ).map(fromRow);
  }

  return read();
}

export async function saveSiteTranslation(item: SiteTranslation) {
  const existing = (await getSiteTranslations()).find(
    (entry) => entry.key === item.key,
  );

  const sourceChanged =
    Boolean(existing) && existing?.sourceTr !== item.sourceTr;

  const staleLocales = sourceChanged
    ? [...translationLocales]
    : item.staleLocales;

  const normalized: SiteTranslation = {
    ...item,
    translations: item.translations || {},
    staleLocales,
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    await supabaseUpsert(
      "site_translations",
      {
        key: normalized.key,
        source_tr: normalized.sourceTr,
        translations: normalized.translations,
        stale_locales: normalized.staleLocales,
      },
      "key",
    );

    return normalized;
  }

  const items = await read();
  const index = items.findIndex((entry) => entry.key === normalized.key);

  if (index >= 0) {
    items[index] = normalized;
  } else {
    items.push(normalized);
  }

  await fs.writeFile(file, JSON.stringify(items, null, 2), "utf8");

  return normalized;
}

export async function getSiteMessages(locale: string) {
  const items = await getSiteTranslations();

  return {
    ...(siteCopy[locale] || siteCopy.tr),
    ...Object.fromEntries(
      items.map((item) => {
        const translated = item.translations?.[locale]?.trim();

        return [
          item.key,
          locale === "tr" || !translated ? item.sourceTr : translated,
        ];
      }),
    ),
  };
}

function flatten(
  value: unknown,
  prefix = "",
): Record<string, string> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.entries(value).reduce<Record<string, string>>(
    (all, [key, item]) => {
      const next = prefix ? `${prefix}.${key}` : key;

      if (typeof item === "string") {
        all[next] = item;
      } else {
        Object.assign(all, flatten(item, next));
      }

      return all;
    },
    {},
  );
}

async function getTurkishSeedMap() {
  let messages: Record<string, string> = {};

  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "messages", "tr.json"),
      "utf8",
    );

    messages = flatten(JSON.parse(raw));
  } catch {
    messages = {};
  }

  return {
    ...messages,
    ...(siteCopy.tr || {}),
  };
}

/**
 * Yeni sabit Türkçe metinleri site_translations tablosuna ekler.
 *
 * Önemli:
 * - Yeni anahtarların yabancı dil alanları BOŞ bırakılır.
 * - Böylece admin panelindeki AI çeviri gerçekten "eksik" alanları görür.
 * - Türkçe kaynak değişmişse mevcut çeviriler korunur fakat bütün hedef
 *   diller stale olarak işaretlenir ve yeniden çevrilebilir.
 */
export async function seedSiteTranslations() {
  const sourceMap = await getTurkishSeedMap();
  const existing = await getSiteTranslations();
  const existingByKey = new Map(existing.map((item) => [item.key, item]));

  let created = 0;
  let updated = 0;

  for (const [key, sourceTr] of Object.entries(sourceMap)) {
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
    total: Object.keys(sourceMap).length,
  };
}