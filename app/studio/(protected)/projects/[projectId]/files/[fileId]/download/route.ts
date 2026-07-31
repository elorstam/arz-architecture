import {NextResponse} from "next/server";
import {createStudioProjectFileDownload} from "@/lib/studio/files/file-repository";
export async function GET(_request:Request,{params}:{params:Promise<{projectId:string;fileId:string}>}){try{const{projectId,fileId}=await params;return NextResponse.redirect(await createStudioProjectFileDownload(projectId,fileId),{status:303});}catch{return new NextResponse("Dosya bulunamadı veya erişim reddedildi.",{status:404,headers:{"Cache-Control":"private, no-store"}});}}
