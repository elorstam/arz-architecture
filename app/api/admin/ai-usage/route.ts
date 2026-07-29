import {NextResponse} from "next/server";

import {isAdmin} from "@/lib/admin-auth";
import {getUsage, saveBudget, type BudgetSettings} from "@/lib/openai-usage";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({error: "Yetkisiz"}, {status: 401});
  }
  try {
    return NextResponse.json(await getUsage());
  } catch (error) {
    console.error("AI usage endpoint failed unexpectedly", error);
    return NextResponse.json(
      {error: "AI kullanım paneli şu anda yüklenemiyor."},
      {status: 500},
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({error: "Yetkisiz"}, {status: 401});
  }
  try {
    const value = (await request.json()) as BudgetSettings;
    return NextResponse.json(await saveBudget(value));
  } catch (error) {
    console.error("AI budget settings could not be saved", error);
    return NextResponse.json(
      {error: "Bütçe ayarları kaydedilemedi. Supabase yetkilerini kontrol edin."},
      {status: 400},
    );
  }
}
