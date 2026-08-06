import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin-auth";
import { translateStrings } from "@/lib/ai-cms";
import {
  OpenAIRequestError,
} from "@/lib/ai-project";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Yetkisiz" },
      { status: 401 },
    );
  }

  try {
    const { source, locales } = await request.json();

    if (
      !source ||
      typeof source !== "object" ||
      !Array.isArray(locales) ||
      locales.length === 0 ||
      locales.length > 3
    ) {
      return NextResponse.json(
        {
          error:
            "Kaynak metinler ve en fazla üç hedef dil gerekli.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      await translateStrings(source, locales),
    );
  } catch (error) {
    const normalized =
      error instanceof OpenAIRequestError
        ? error
        : new OpenAIRequestError(
            "Site çevirileri tamamlanamadı.",
            500,
            String(error),
          );

    console.error("Site translations AI failed", {
      status: normalized.status,
      message: normalized.message,
      detail: normalized.detail,
    });

    return NextResponse.json(
      { error: normalized.message },
      { status: normalized.status === 504 ? 504 : 502 },
    );
  }
}