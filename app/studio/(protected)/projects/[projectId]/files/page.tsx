import {notFound} from "next/navigation";
import StudioProjectFilesPage from "@/components/studio/files/StudioProjectFilesPage";
import {getStudioProjectFileWorkspace} from "@/lib/studio/files/file-repository";
import {STUDIO_FILE_CATEGORIES} from "@/lib/studio/files/file-constants";
import type {StudioFileArchiveFilter} from "@/lib/studio/files/file-types";
import {getStudioGoogleDriveStatus} from "@/lib/studio/files/storage/google-drive-mapping";
import {notFound as nextNotFound} from "next/navigation";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function ProjectFilesPage({params,searchParams}:{params:Promise<{projectId:string}>;searchParams:Promise<{folder?:string;q?:string;category?:string;extension?:string;archive?:string}>}){
 const{projectId}=await params;const query=await searchParams;
 const status=await getStudioGoogleDriveStatus(projectId).catch(()=>nextNotFound());
 if(!status.connected||status.needsReauth||!status.initialized){return <DriveBlockingState projectId={projectId} status={status}/>;}
 const workspace=await getStudioProjectFileWorkspace(projectId,{folderId:query.folder,query:query.q?.trim().slice(0,120),category:STUDIO_FILE_CATEGORIES.find(v=>v===query.category),extension:query.extension?.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,10),archive:(["active","archived","all"].includes(query.archive??"")?query.archive:"active") as StudioFileArchiveFilter}).catch(()=>notFound());
 return <StudioProjectFilesPage workspace={workspace}/>;
}
function DriveBlockingState({projectId,status}:{projectId:string;status:Awaited<ReturnType<typeof getStudioGoogleDriveStatus>>}){return <section className="mx-auto max-w-3xl px-6 py-16"><div className="rounded-2xl border border-[#ded8cc] bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-semibold text-[#25211d]">Google Drive</h1><p className="mt-3 text-sm text-[#6f6a63]">{status.needsReauth?"Google Drive bağlantısının yeniden yetkilendirilmesi gerekiyor.":!status.connected?(status.canManage?"Proje dosyalarını kullanmak için Google Drive bağlantısını tamamlayın.":"Google Drive bağlantısı bulunmadığı için proje dosyalarına erişilemiyor."):status.canManage?"Bu proje için Google Drive klasörleri henüz hazırlanmadı.":"Bu proje için Google Drive klasörleri henüz hazır değil."}</p>{status.canManage&&<div className="mt-6 flex justify-center gap-3"><Link href="/studio/settings/storage" className="studio-button studio-button--primary studio-button--sm">{status.needsReauth?"Yeniden Bağlan":"Google Drive Ayarları"}</Link></div>}</div></section>}
