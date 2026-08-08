import {NextResponse,type NextRequest} from "next/server";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import {appDestination} from "@/lib/routing/app-domains";
export async function GET(request:NextRequest){
 const host=request.headers.get("x-forwarded-host")||request.headers.get("host");
 const destination=(path:string)=>new URL(appDestination("studio",path,host),request.url);
 const code=request.nextUrl.searchParams.get("code");
 if(!code)return NextResponse.redirect(destination("/studio/login?error=callback"));
 try{const supabase=await createStudioServerClient();const{error}=await supabase.auth.exchangeCodeForSession(code);if(error)throw error;return NextResponse.redirect(destination("/studio"));}
 catch(error){console.error("Studio auth callback failed",error);return NextResponse.redirect(destination("/studio/login?error=callback"));}
}
