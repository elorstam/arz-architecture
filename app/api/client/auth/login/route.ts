import {NextResponse} from "next/server";
import {z} from "zod";
import {safeClientNext,resolveAuthenticatedDestination} from "@/lib/client-portal/auth";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

const schema=z.object({email:z.string().email().max(320),password:z.string().min(1).max(1024),next:z.string().optional()});
export async function POST(request:Request){
 const input=schema.safeParse(await request.json().catch(()=>null));
 if(!input.success)return NextResponse.json({error:"Geçerli e-posta ve şifre gerekli."},{status:400});
 const supabase=await createStudioServerClient();
 const{error}=await supabase.auth.signInWithPassword({email:input.data.email,password:input.data.password});
 if(error)return NextResponse.json({error:"E-posta veya şifre hatalı."},{status:401});
 const result=await resolveAuthenticatedDestination();
 if(result.kind==="staff")return NextResponse.json({destination:"/studio"});
 if(result.kind!=="client"){await supabase.auth.signOut();return NextResponse.json({error:"Bu hesap için aktif müşteri proje erişimi bulunmuyor."},{status:403});}
 return NextResponse.json({destination:safeClientNext(input.data.next)});
}
