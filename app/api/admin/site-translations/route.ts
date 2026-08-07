import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin-auth";
import {
  saveSiteTranslationWithRetry,
  saveSiteTranslationsBulk,
  getSiteTranslationsWithRetry,
} from "@/lib/site-translation-bulk-save";
import {
  seedSiteTranslations,
} from "@/lib/site-translation-store";
import {
  seedLegalTranslations,
} from "@/lib/legal/legal-translation-seed";
import type {
  SiteTranslation,
} from "@/types/cms";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json(
      {
        error: "Yetkisiz",
      },
      {
        status: 401,
      },
    );
  }

  try {
    return NextResponse.json(
      await getSiteTranslationsWithRetry(),
    );
  } catch (error) {
    console.error(
      "Site translations GET failed",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Site çevirileri yüklenemedi.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: Request,
) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      {
        error: "Yetkisiz",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const body =
      await request.json();

    if (body.seed) {
      const baseSeed =
        await seedSiteTranslations();

      const legalSeed =
        await seedLegalTranslations();

      return NextResponse.json({
        created:
          (baseSeed.created ?? 0) +
          legalSeed.created,

        updated:
          (baseSeed.updated ?? 0) +
          legalSeed.updated,

        total:
          (baseSeed.total ?? 0) +
          legalSeed.total,

        base: baseSeed,
        legal: legalSeed,
      });
    }

    /*
     * AI sonucu artık yüzlerce ayrı browser POST'u
     * yerine tek HTTP isteğiyle buraya geliyor.
     */
    if (Array.isArray(body.bulk)) {
      if (body.bulk.length > 600) {
        return NextResponse.json(
          {
            error:
              "Tek istekte en fazla 600 çeviri kaydı kabul edilir.",
          },
          {
            status: 400,
          },
        );
      }

      return NextResponse.json(
        await saveSiteTranslationsBulk(
          body.bulk as SiteTranslation[],
        ),
      );
    }

    /*
     * Admin tablosundaki manuel tekil Kaydet butonu
     * eski davranışını koruyor.
     */
    return NextResponse.json(
      await saveSiteTranslationWithRetry(
        body as SiteTranslation,
      ),
    );
  } catch (error) {
    console.error(
      "Site translations POST failed",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Site çevirisi kaydedilemedi.",
      },
      {
        status: 500,
      },
    );
  }
}