import {ClientRenderPreviewError,createClientRenderPreview} from "@/lib/client-portal/renders/client-render-preview";

export const dynamic="force-dynamic";

export async function GET(_request:Request,{params}:{params:Promise<{renderId:string}>}){
 try{
  const{renderId}=await params;
  const preview=await createClientRenderPreview(renderId);
  const headers=new Headers({"Content-Type":preview.mimeType,"Cache-Control":"private, no-store","Content-Disposition":"inline","Content-Security-Policy":"default-src 'none'; sandbox","Cross-Origin-Resource-Policy":"same-origin","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"});
  const length=preview.response.headers.get("content-length");
  if(length)headers.set("Content-Length",length);
  return new Response(preview.response.body,{status:preview.response.status,headers});
 }catch(error){
  const status=error instanceof ClientRenderPreviewError?error.status:503;
  const message=status===401?"Oturum gerekli.":status===404?"Render önizlemesi bulunamadı veya erişim reddedildi.":"Render önizlemesi geçici olarak kullanılamıyor.";
  return new Response(message,{status,headers:{"Cache-Control":"private, no-store","Content-Type":"text/plain; charset=utf-8","Content-Security-Policy":"default-src 'none'; sandbox","X-Content-Type-Options":"nosniff"}});
 }
}
