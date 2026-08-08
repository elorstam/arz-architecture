import {NextResponse} from "next/server";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import {appDestination} from "@/lib/routing/app-domains";
export async function POST(request:Request){const supabase=await createStudioServerClient();await supabase.auth.signOut();return NextResponse.json({success:true,destination:appDestination("client","/client/login",request.headers.get("x-forwarded-host")||request.headers.get("host"))});}
