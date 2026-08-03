import {ClientFileDownloadError,createClientFileDownload} from "@/lib/client-portal/files/client-file-download";

export const dynamic="force-dynamic";

function disposition(name:string){
 const ascii=name.normalize("NFKD").replace(/[^\x20-\x7E]/g,"_").replace(/["\\\r\n]/g,"-");
 return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export async function GET(_request:Request,{params}:{params:Promise<{fileId:string}>}){
 try{
  const{fileId}=await params;
  const download=await createClientFileDownload(fileId);
  const headers=new Headers({"Content-Type":download.response.headers.get("content-type")??"application/octet-stream","Content-Disposition":disposition(download.fileName),"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"});
  const length=download.response.headers.get("content-length");
  if(length)headers.set("Content-Length",length);
  return new Response(download.response.body,{status:download.response.status,headers});
 }catch(error){
  const status=error instanceof ClientFileDownloadError?error.status:503;
  const message=status===401?"Oturum gerekli.":status===404?"Dosya bulunamadı veya erişim reddedildi.":"Dosya geçici olarak indirilemiyor.";
  return new Response(message,{status,headers:{"Cache-Control":"private, no-store","Content-Type":"text/plain; charset=utf-8","X-Content-Type-Options":"nosniff"}});
 }
}
