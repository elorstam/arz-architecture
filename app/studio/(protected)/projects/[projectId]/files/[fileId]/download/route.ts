import {NextResponse} from "next/server";
import {createStudioProjectFileDownload} from "@/lib/studio/files/file-repository";
import {StudioFileError} from "@/lib/studio/files/file-errors";

export const dynamic="force-dynamic";

function disposition(name:string,inline=false){const ascii=name.normalize("NFKD").replace(/[^\x20-\x7E]/g,"_").replace(/["\\]/g,"-");return `${inline?"inline":"attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;}
function protectInlineSvg(headers:Headers,inline:boolean){if(inline&&headers.get("content-type")?.toLowerCase().includes("image/svg"))headers.set("Content-Security-Policy","default-src 'none'; sandbox");}
function streamed(response:Response,fileName:string,inline:boolean){const headers=new Headers({"Content-Type":response.headers.get("content-type")??"application/octet-stream","Content-Disposition":disposition(fileName,inline),"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"});protectInlineSvg(headers,inline);const length=response.headers.get("content-length");if(length)headers.set("Content-Length",length);const ranges=response.headers.get("accept-ranges");if(ranges)headers.set("Accept-Ranges",ranges);return new Response(response.body,{status:response.status,headers});}

export async function GET(request:Request,{params}:{params:Promise<{projectId:string;fileId:string}>}){
 const preview=new URL(request.url).searchParams.get("preview")==="1";
 try{
  const{projectId,fileId}=await params;
  const result=await createStudioProjectFileDownload(projectId,fileId);
  if(result.kind==="stream"){const headers=new Headers({"Content-Type":result.response.headers.get("content-type")??"application/octet-stream","Content-Disposition":disposition(result.fileName,preview),"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"});protectInlineSvg(headers,preview);const length=result.response.headers.get("content-length");if(length)headers.set("Content-Length",length);return new Response(result.response.body,{status:result.response.status,headers});}
  if(preview){const privateResponse=await fetch(result.url,{cache:"no-store"});if(!privateResponse.ok)throw new StudioFileError("storage","Önizleme stream'i alınamadı.");return streamed(privateResponse,result.fileName,true);}
  return NextResponse.redirect(result.url,{status:303});
 }catch(error){
  const code=error instanceof StudioFileError?error.code:"storage";
  const message=code==="reauthorization_required"||(error instanceof Error&&error.message.includes("yetkilendiril"))?"Google Drive bağlantısının yeniden yetkilendirilmesi gerekiyor.":code==="forbidden"?(preview?"Dosyayı görüntüleme yetkiniz bulunmuyor.":"Dosyayı indirme yetkiniz bulunmuyor."):code==="not_found"?"Google Drive dosyası bulunamadı.":preview?"Dosya geçici olarak görüntülenemiyor.":"Dosya geçici olarak indirilemiyor.";
  return new NextResponse(message,{status:code==="forbidden"?403:code==="unauthorized"?401:code==="not_found"?404:503,headers:{"Cache-Control":"private, no-store","Content-Type":"text/plain; charset=utf-8"}});
 }
}
