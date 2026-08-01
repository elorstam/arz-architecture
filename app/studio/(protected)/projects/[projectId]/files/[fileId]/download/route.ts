import {NextResponse} from "next/server";
import {createStudioProjectFileDownload} from "@/lib/studio/files/file-repository";
import {StudioFileError} from "@/lib/studio/files/file-errors";

export const dynamic="force-dynamic";

function disposition(name:string){const ascii=name.normalize("NFKD").replace(/[^\x20-\x7E]/g,"_").replace(/["\\]/g,"-");return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;}

export async function GET(_request:Request,{params}:{params:Promise<{projectId:string;fileId:string}>}){
 try{
  const{projectId,fileId}=await params;
  const result=await createStudioProjectFileDownload(projectId,fileId);
  if(result.kind==="stream"){
   const headers=new Headers({"Content-Type":result.response.headers.get("content-type")??"application/octet-stream","Content-Disposition":disposition(result.fileName),"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"});
   const length=result.response.headers.get("content-length");if(length)headers.set("Content-Length",length);
   return new Response(result.response.body,{status:200,headers});
  }
  return NextResponse.redirect(result.url,{status:303});
 }catch(error){
  const code=error instanceof StudioFileError?error.code:"storage";
  const message=code==="reauthorization_required"||(error instanceof Error&&error.message.includes("yetkilendiril"))?"Google Drive bağlantısının yeniden yetkilendirilmesi gerekiyor.":code==="forbidden"?"Dosyayı indirme yetkiniz bulunmuyor.":code==="not_found"?"Google Drive dosyası bulunamadı.":"Dosya geçici olarak indirilemiyor.";
  return new NextResponse(message,{status:code==="forbidden"?403:code==="unauthorized"?401:code==="not_found"?404:503,headers:{"Cache-Control":"private, no-store","Content-Type":"text/plain; charset=utf-8"}});
 }
}
