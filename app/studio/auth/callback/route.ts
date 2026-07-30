import {NextResponse,type NextRequest} from "next/server";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
export async function GET(request:NextRequest){
 const code=request.nextUrl.searchParams.get("code");
 if(!code)return NextResponse.redirect(new URL("/studio/login?error=callback",request.url));
 try{const supabase=await createStudioServerClient();const{error}=await supabase.auth.exchangeCodeForSession(code);if(error)throw error;return NextResponse.redirect(new URL("/studio",request.url));}
 catch(error){console.error("Studio auth callback failed",error);return NextResponse.redirect(new URL("/studio/login?error=callback",request.url));}
}
