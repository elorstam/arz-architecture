import "server-only";

import { translationLocales } from "@/i18n/locales";
import {
  getSiteTranslations,
  saveSiteTranslation,
} from "@/lib/site-translation-store";
import {
  isSupabaseConfigured,
  supabaseUpsert,
} from "@/lib/supabase-rest";
import type { SiteTranslation } from "@/types/cms";

const WRITE_BATCH_SIZE = 8;
const MAX_ATTEMPTS = 4;

type FailedTranslationSave = {
  key: string;
  error: string;
};

export type BulkSiteTranslationSaveResult = {
  saved: SiteTranslation[];
  failed: FailedTranslationSave[];
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : String(error);
}

function isRetryableSupabaseError(error: unknown) {
  const message = errorMessage(error);

  return (
    message.includes("PGRST303") ||
    message.includes("JWT issued at future") ||
    message.includes("fetch failed") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT") ||
    message.includes("429") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504")
  );
}

async function withRetry<T>(
  operation: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt += 1
  ) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (
        attempt === MAX_ATTEMPTS ||
        !isRetryableSupabaseError(error)
      ) {
        throw error;
      }

      /*
       * Özellikle PGRST303 / "JWT issued at future" gibi
       * geçici Supabase doğrulama hatalarında kısa bir süre
       * bekleyip aynı işlemi yeniden deniyoruz.
       */
      await sleep(500 * attempt * attempt);
    }
  }

  throw lastError;
}

function chunk<T>(
  items: T[],
  size: number,
): T[][] {
  const result: T[][] = [];

  for (
    let index = 0;
    index < items.length;
    index += size
  ) {
    result.push(
      items.slice(index, index + size),
    );
  }

  return result;
}

export async function getSiteTranslationsWithRetry() {
  return withRetry(() =>
    getSiteTranslations(),
  );
}

export async function saveSiteTranslationWithRetry(
  item: SiteTranslation,
) {
  return withRetry(() =>
    saveSiteTranslation(item),
  );
}

export async function saveSiteTranslationsBulk(
  input: SiteTranslation[],
): Promise<BulkSiteTranslationSaveResult> {
  /*
   * Aynı key yanlışlıkla birden fazla gönderilirse
   * son değer kazanır.
   */
  const deduped = [
    ...new Map(
      input.map((item) => [
        item.key,
        item,
      ]),
    ).values(),
  ];

  if (!deduped.length) {
    return {
      saved: [],
      failed: [],
    };
  }

  /*
   * Kritik fark:
   * Eski sistem her item için bütün tabloyu tekrar SELECT ediyordu.
   * Burada tabloyu yalnız BİR KEZ okuyoruz.
   */
  const existing =
    await getSiteTranslationsWithRetry();

  const existingByKey = new Map(
    existing.map((item) => [
      item.key,
      item,
    ]),
  );

  const normalized =
    deduped.map((item) => {
      const current =
        existingByKey.get(item.key);

      const sourceChanged =
        Boolean(current) &&
        current?.sourceTr !==
          item.sourceTr;

      return {
        ...item,

        translations:
          item.translations || {},

        staleLocales:
          sourceChanged
            ? [...translationLocales]
            : item.staleLocales,

        updatedAt:
          new Date().toISOString(),
      } satisfies SiteTranslation;
    });

  /*
   * Supabase yoksa mevcut local JSON store davranışını
   * koruyoruz. Bu yol production performansını etkilemez.
   */
  if (!isSupabaseConfigured()) {
    const saved: SiteTranslation[] = [];
    const failed: FailedTranslationSave[] =
      [];

    for (const item of normalized) {
      try {
        saved.push(
          await saveSiteTranslationWithRetry(
            item,
          ),
        );
      } catch (error) {
        failed.push({
          key: item.key,
          error: errorMessage(error),
        });
      }
    }

    return {
      saved,
      failed,
    };
  }

  const saved: SiteTranslation[] = [];
  const failed: FailedTranslationSave[] =
    [];

  /*
   * Supabase yazımlarını kontrollü küçük gruplarla
   * paralel yürütüyoruz.
   *
   * Tek bir key hata verirse diğer keyler DURMUYOR.
   */
  for (const group of chunk(
    normalized,
    WRITE_BATCH_SIZE,
  )) {
    const results =
      await Promise.allSettled(
        group.map(async (item) => {
          await withRetry(() =>
            supabaseUpsert(
              "site_translations",
              {
                key: item.key,
                source_tr:
                  item.sourceTr,
                translations:
                  item.translations,
                stale_locales:
                  item.staleLocales,
              },
              "key",
            ),
          );

          return item;
        }),
      );

    results.forEach(
      (result, index) => {
        const item = group[index];

        if (
          result.status ===
          "fulfilled"
        ) {
          saved.push(
            result.value,
          );

          return;
        }

        failed.push({
          key: item.key,
          error: errorMessage(
            result.reason,
          ),
        });
      },
    );
  }

  return {
    saved,
    failed,
  };
}