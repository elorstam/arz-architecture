import {NextResponse} from "next/server";
import {z} from "zod";

import {
  createClientInvitationAdminClient,
  getInvitationPreview,
  resolveAuthenticatedDestination,
} from "@/lib/client-portal/auth";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import {appDestination} from "@/lib/routing/app-domains";

const schema=z.object({
  token:z.string().min(16).max(512),
  mode:z.enum(["login","signup"]),
  name:z.string().trim().max(120).optional(),
  password:z.string().min(8).max(1024),
}).superRefine((value,context)=>{
  if(value.mode==="signup"&&!value.name)context.addIssue({code:"custom",path:["name"],message:"name_required"});
});

function safeError(message?:string){
  if(message?.includes("staff_membership"))return{status:403,error:"Ekip hesabı müşteri davetini kabul edemez."};
  if(message?.includes("access_missing"))return{status:409,error:"Davet kabul edildi ancak proje erişimi doğrulanamadı. Lütfen ARZ Mimarlık ile iletişime geçin."};
  return{status:400,error:"Davet kabul edilemedi. Bağlantı geçersiz, süresi dolmuş veya farklı bir hesaba ait olabilir."};
}

const normalized=(value:string)=>value.trim().toLowerCase();
const isExistingUserError=(error:{code?:string})=>error.code==="email_exists"||error.code==="user_already_exists";

async function findUserByEmail(email:string){
  const admin=createClientInvitationAdminClient();
  for(let page=1;;page+=1){
    const{data,error}=await admin.auth.admin.listUsers({page,perPage:1000});
    if(error)throw error;
    const user=data.users.find(item=>normalized(item.email??"")===normalized(email));
    if(user)return user;
    if(data.users.length<1000)return null;
  }
}

async function signInInvitationUser(email:string,password:string){
  const supabase=await createStudioServerClient();
  let result=await supabase.auth.signInWithPassword({email,password});
  if(result.error?.code==="email_not_confirmed"){
    const user=await findUserByEmail(email);
    if(!user)return{error:result.error,supabase};
    const admin=createClientInvitationAdminClient();
    const{error}=await admin.auth.admin.updateUserById(user.id,{email_confirm:true});
    if(error)throw error;
    result=await supabase.auth.signInWithPassword({email,password});
  }
  return{error:result.error,supabase};
}

export async function POST(request:Request){
  const input=schema.safeParse(await request.json().catch(()=>null));
  if(!input.success)return NextResponse.json({error:"Ad soyad ve en az 8 karakterli şifre gereklidir."},{status:400});

  const preview=await getInvitationPreview(input.data.token).catch(()=>({state:"unavailable" as const}));
  if(preview.state==="unavailable")return NextResponse.json({error:"Davet şu anda doğrulanamıyor. Lütfen kısa bir süre sonra tekrar deneyin."},{status:503});
  if(preview.state!=="valid"&&preview.state!=="accepted")return NextResponse.json(safeError(),{status:400});

  let supabase:Awaited<ReturnType<typeof createStudioServerClient>>;
  if(input.data.mode==="signup"){
    const admin=createClientInvitationAdminClient();
    const{error:createError}=await admin.auth.admin.createUser({
      email:preview.email!,
      password:input.data.password,
      email_confirm:true,
      user_metadata:{full_name:input.data.name},
    });
    if(createError&&!isExistingUserError(createError)){
      return NextResponse.json({error:"Hesap oluşturulamadı. Şifre koşullarını kontrol edin."},{status:createError.status===422?400:500});
    }
    const signedIn=await signInInvitationUser(preview.email!,input.data.password);
    supabase=signedIn.supabase;
    if(signedIn.error){
      return NextResponse.json({error:createError?"Bu e-posta için bir hesap zaten var. Mevcut hesap şifrenizi girin.":"Hesap oluşturuldu ancak oturum açılamadı. Lütfen tekrar deneyin."},{status:401});
    }
  }else{
    const signedIn=await signInInvitationUser(preview.email!,input.data.password);
    supabase=signedIn.supabase;
    if(signedIn.error)return NextResponse.json({error:"Davet e-postası için şifre hatalı."},{status:401});
  }

  const{data:{user}}=await supabase.auth.getUser();
  if(!user||normalized(user.email??"")!==normalized(preview.email??"")){
    await supabase.auth.signOut();
    return NextResponse.json({error:"Oturum e-postası davet e-postasıyla eşleşmiyor."},{status:403});
  }

  const{error:acceptError}=await supabase.rpc("studio_accept_client_invitation",{p_token:input.data.token});
  if(acceptError){const mapped=safeError(acceptError.message);return NextResponse.json({error:mapped.error},{status:mapped.status});}
  const destination=await resolveAuthenticatedDestination();
  if(destination.kind!=="client")return NextResponse.json({error:"Davet kabul edildi ancak proje erişimi doğrulanamadı. Lütfen ARZ Mimarlık ile iletişime geçin."},{status:409});
  return NextResponse.json({success:true,destination:appDestination("client","/client",request.headers.get("x-forwarded-host")||request.headers.get("host"))});
}
