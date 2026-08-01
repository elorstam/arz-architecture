import {NextResponse} from "next/server";

import {isAdmin} from "@/lib/admin-auth";
import {getUsage, saveBudget, type BudgetSettings} from "@/lib/openai-usage";

export async function GET(request:Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({error: "Yetkisiz"}, {status: 401});
  }
  try {
    const p=new URL(request.url).searchParams;const bool=(key:string)=>p.has(key)?p.get(key)==="true":undefined;
    return NextResponse.json(await getUsage({from:p.get("from")||undefined,to:p.get("to")||undefined,module:p.get("module")||undefined,operation:p.get("operation")||undefined,model:p.get("model")||undefined,organizationId:p.get("organization")||undefined,userId:p.get("user")||undefined,status:p.get("status")||undefined,fallbackUsed:bool("fallback"),usageUnavailable:bool("usageUnavailable"),pricingUnknown:bool("pricingUnknown")}));
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
