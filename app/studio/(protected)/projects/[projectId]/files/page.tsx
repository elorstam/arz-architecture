import Link from "next/link";
import {notFound} from "next/navigation";
import StudioProjectFilesPage from "@/components/studio/files/StudioProjectFilesPage";
import StudioEntityTags from "@/components/studio/tags/StudioEntityTags";
import StudioTagFilterForm from "@/components/studio/tags/StudioTagFilterForm";import{filterEntityIdsByTags}from"@/lib/studio/tags/tag-assignment-repository";
import {STUDIO_FILE_CATEGORIES} from "@/lib/studio/files/file-constants";
import {getStudioProjectFileWorkspace} from "@/lib/studio/files/file-repository";
import type {StudioFileArchiveFilter} from "@/lib/studio/files/file-types";
import {getStudioGoogleDriveStatus} from "@/lib/studio/files/storage/google-drive-mapping";
import {initializeProjectDriveStorageAction} from "./actions";

export const dynamic="force-dynamic";

export default async function ProjectFilesPage({params,searchParams}:{params:Promise<{projectId:string}>;searchParams:Promise<{folder?:string;q?:string;category?:string;extension?:string;archive?:string;error?:string;tags?:string|string[];tagMode?:string}>}){
 const{projectId}=await params;const query=await searchParams;
 const status=await getStudioGoogleDriveStatus(projectId).catch(()=>notFound());
 if(!status.connected||status.needsReauth||!status.initialized)return <DriveBlockingState projectId={projectId} status={status} error={query.error}/>;
 const workspace=await getStudioProjectFileWorkspace(projectId,{folderId:query.folder,query:query.q?.trim().slice(0,120),category:STUDIO_FILE_CATEGORIES.find(value=>value===query.category),extension:query.extension?.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,10),archive:(["active","archived","all"].includes(query.archive??"")?query.archive:"active") as StudioFileArchiveFilter}).catch(()=>notFound());
 const tagIds=(Array.isArray(query.tags)?query.tags:(query.tags??"").split(",")).filter(Boolean);const tagMode=query.tagMode==="all"?"all":"any";const matched=await filterEntityIdsByTags("file",tagIds,tagMode);const filtered=matched?{...workspace,files:workspace.files.filter(file=>matched.has(file.id))}:workspace;return <><StudioTagFilterForm selected={tagIds} mode={tagMode}/><StudioProjectFilesPage workspace={filtered}/>{workspace.currentFolder?<div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8"><StudioEntityTags entityType="folder" entityId={workspace.currentFolder.id} title="Klasör Etiketleri"/></div>:null}</>;
}

function DriveBlockingState({projectId,status,error}:{projectId:string;status:Awaited<ReturnType<typeof getStudioGoogleDriveStatus>>;error?:string}){
 // Previous recovery copy: Proje klasörleri hazırlanamadı. Lütfen yeniden deneyin.
 const initializeAction=initializeProjectDriveStorageAction.bind(null,projectId);const settingsRequired=!status.connected||!status.rootReady;const initializationFailed=error==="project_drive_initialization_failed"||status.project?.storage_sync_status==="error";
 const description=status.needsReauth?"Google Drive bağlantısının yeniden yetkilendirilmesi gerekiyor.":!status.connected?(status.canManage?"Proje dosyalarını kullanmak için Google Drive bağlantısını tamamlayın.":"Google Drive bağlantısı bulunmadığı için proje dosyalarına erişilemiyor."):!status.rootReady?(status.canManage?"Google Drive root ve Projects klasörlerinin hazırlanması gerekiyor.":"Google Drive çalışma alanı henüz hazır değil."):status.canManage?"Bu proje için Google Drive klasörleri henüz hazır değil.":"Bu proje için Google Drive klasörleri henüz hazır değil.";
 return <section className="mx-auto max-w-3xl px-6 py-16"><div className="rounded-2xl border border-[#ded8cc] bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-semibold text-[#25211d]">Google Drive</h1><p className="mt-3 text-sm text-[#6f6a63]">{description}</p>{initializationFailed?<p role="alert" className="mt-4 text-sm text-[#8b5141]">Drive klasörleri hazırlanamadı. Tekrar Dene.</p>:null}{status.canManage?<div className="mt-6 flex justify-center gap-3">{status.needsReauth?<Link href="/studio/settings/storage" className="studio-button studio-button--primary studio-button--sm">Yeniden Bağlan</Link>:settingsRequired?<Link href="/studio/settings/storage" className="studio-button studio-button--primary studio-button--sm">Google Drive Ayarları</Link>:<form action={initializeAction}><button type="submit" className="studio-button studio-button--primary studio-button--sm">Proje Klasörlerini Hazırla</button></form>}</div>:null}</div></section>;
}
