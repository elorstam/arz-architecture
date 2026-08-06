import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin-auth";
import {
  getSiteTranslations,
  saveSiteTranslation,
  seedSiteTranslations,
} from "@/lib/site-translation-store";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Yetkisiz" },
      { status: 401 },
    );
  }

  return NextResponse.json(await getSiteTranslations());
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Yetkisiz" },
      { status: 401 },
    );
  }

  const body = await request.json();

  return NextResponse.json(
    body.seed
      ? await seedSiteTranslations()
      : await saveSiteTranslation(body),
  );
}