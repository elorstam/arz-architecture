import {NextResponse} from "next/server";
import {z} from "zod";
import {getInvitationPreview,resolveAuthenticatedDestination} from "@/lib/client-portal/auth";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

const schema=z.object({token:z.string().min(16).max(512),mode:z.enum(["login","signup"]),password:z.string().min(8).max(1024)});
function safeError(message?:string){if(message?.includes("staff_membership"))return{status:403,error:"Ekip hesabı müşteri davetini kabul edemez."};if(message?.includes("access_missing"))return{status:409,error:"Davet kabul edildi ancak proje erişimi doğrulanamadı. Lütfen ARZ Mimarlık ile iletişime geçin."};return{status:400,error:"Davet kabul edilemedi. Bağlantı geçersiz, süresi dolmuş veya farklı bir hesaba ait olabilir."};}
export async function POST(request:Request){
 const input=schema.safeParse(await request.json().catch(()=>null));if(!input.success)return NextResponse.json({error:"Şifre en az 8 karakter olmalıdır."},{status:400});
 const preview=await getInvitationPreview(input.data.token).catch(()=>({state:"invalid" as const}));
 if(preview.state!=="valid"&&preview.state!=="accepted")return NextResponse.json(safeError(),{status:400});
 const supabase=await createStudioServerClient();
 if(input.data.mode==="signup"){
  const{data,error}=await supabase.auth.signUp({email:preview.email!,password:input.data.password});
  if(error)return NextResponse.json({error:error.message.toLowerCase().includes("registered")?"Bu e-posta için bir hesap zaten var. Mevcut hesapla giriş yapın.":"Hesap oluşturulamadı. Şifre koşullarını kontrol edin."},{status:409});
  if(!data.session)return NextResponse.json({error:"Hesabınızı doğrulamak için e-posta adresinize gönderilen bağlantıyı açın, ardından davet sayfasına dönün."},{status:202});
 }else{
  const{error}=await supabase.auth.signInWithPassword({email:preview.email!,password:input.data.password});
  if(error)return NextResponse.json({error:"Davet e-postası için şifre hatalı."},{status:401});
 }
 const{data:{user}}=await supabase.auth.getUser();
 if(!user||user.email?.toLocaleLowerCase("tr-TR")!==preview.email?.toLocaleLowerCase("tr-TR")){await supabase.auth.signOut();return NextResponse.json({error:"Oturum e-postası davet e-postasıyla eşleşmiyor."},{status:403});}
 const{error:acceptError}=await supabase.rpc("studio_accept_client_invitation",{p_token:input.data.token});
 if(acceptError){const mapped=safeError(acceptError.message);return NextResponse.json({error:mapped.error},{status:mapped.status});}
 const destination=await resolveAuthenticatedDestination();
 if(destination.kind!=="client")return NextResponse.json({error:"Davet kabul edildi ancak proje erişimi doğrulanamadı. Lütfen ARZ Mimarlık ile iletişime geçin."},{status:409});
 return NextResponse.json({success:true,destination:"/client"});
}
