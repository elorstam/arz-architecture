import {NextResponse} from "next/server";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
export async function POST(){const supabase=await createStudioServerClient();await supabase.auth.signOut();return NextResponse.json({success:true,destination:"/client/login"});}
