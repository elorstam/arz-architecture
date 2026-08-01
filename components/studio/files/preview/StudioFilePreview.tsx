"use client";
import dynamic from "next/dynamic";
import {studioButtonClass} from "@/components/studio/StudioButton";
import StudioSyncStatus from "../StudioSyncStatus";
import type {StudioProjectFile} from "@/lib/studio/files/file-types";
import type {StudioFileVersion} from "@/lib/studio/files/versions/version-types";
import {buildStudioPreviewUrl,getStudioPreviewKind} from "@/lib/studio/files/preview/preview-utils";
import StudioPreviewSkeleton from "./StudioPreviewSkeleton";
import StudioUnsupportedPreview from "./StudioUnsupportedPreview";

const StudioImagePreview=dynamic(()=>import("./StudioImagePreview"),{ssr:false,loading:()=> <StudioPreviewSkeleton/>});
const StudioPdfPreview=dynamic(()=>import("./StudioPdfPreview"),{ssr:false,loading:()=> <StudioPreviewSkeleton/>});

function Info({label,value}:{label:string;value:React.ReactNode}){return <div><dt className="text-sm font-semibold text-[#77736b]">{label}</dt><dd className="mt-1.5 break-words text-[15px] leading-6 text-[#303a40]">{value||"—"}</dd></div>;}

export default function StudioFilePreview({file,versions,selectedVersionId,onSelectVersion}:{file:StudioProjectFile;versions:StudioFileVersion[];selectedVersionId:string;onSelectVersion:(id:string)=>void}){
 const selected=versions.find(version=>version.id===selectedVersionId&&version.status==="ready")??versions.find(version=>version.isCurrent&&version.status==="ready")??null;
 const extension=selected?.extension||file.extension;
 const mimeType=selected?.mimeType||file.mimeType;
 const previewUrl=buildStudioPreviewUrl(file.projectId,file.id,selected?.id);
 const downloadUrl=previewUrl.replace("?preview=1","");
 const kind=getStudioPreviewKind(extension,mimeType);
 return <section id="file-preview" className="mt-5 scroll-mt-5 rounded-xl border border-[#dedad1] bg-white p-4 sm:p-6" aria-labelledby="file-preview-title">
  <div className="flex flex-col gap-4 border-b border-[#e2ded6] pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[13px] font-semibold uppercase tracking-[.12em] text-[#9a7b43]">Güvenli görüntüleme</p><h2 id="file-preview-title" className="mt-1 text-xl font-semibold">Dosya Önizleme</h2><p className="mt-1 text-sm leading-6 text-[#69716f]">Dosya public yapılmadan authenticated ARZ Studio stream’i üzerinden görüntülenir.</p></div>{versions.length?<label className="text-sm font-semibold text-[#666d6a]">Görüntülenen sürüm<select value={selected?.id??""} onChange={event=>onSelectVersion(event.target.value)} className="mt-2 h-11 min-w-44 rounded-lg border border-[#d8d3c9] bg-white px-3 text-sm focus:border-[#9a7b43] focus:outline-none focus:ring-2 focus:ring-[#d8c49c]"><option value="" disabled>Sürüm seçin</option>{versions.filter(version=>version.status==="ready").map(version=><option key={version.id} value={version.id}>V{version.versionNumber}{version.revisionCode?` · ${version.revisionCode}`:""}{version.isCurrent?" · Güncel":""}</option>)}</select></label>:null}</div>
  <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
   <div className="min-w-0">{kind==="image"?<StudioImagePreview src={previewUrl} name={file.displayName}/>:kind==="pdf"?<StudioPdfPreview src={previewUrl} name={file.displayName}/>:<StudioUnsupportedPreview extension={extension} downloadUrl={downloadUrl}/>}</div>
   <aside className="rounded-xl border border-[#e2ded6] bg-[#fbfaf7] p-5" aria-label="Önizlenen dosya bilgileri"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-semibold">Dosya Bilgileri</h3><StudioSyncStatus status={selected?.syncStatus??file.syncStatus}/></div><dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><Info label="Dosya adı" value={file.displayName}/><Info label="Tür" value={`${extension.toUpperCase()} · ${mimeType}`}/><Info label="Boyut" value={selected?.fileSizeLabel??file.fileSizeLabel}/><Info label="Revizyon" value={selected?.revisionCode||"Revizyon kodu yok"}/><Info label="Current Version" value={`V${selected?.versionNumber||file.versionNumber||1}${selected?.isCurrent?" · Güncel":""}`}/><Info label="Oluşturan" value={selected?.uploadedBy.name??file.uploadedBy.name}/><Info label="Oluşturulma tarihi" value={selected?.createdAtLabel??file.createdAtLabel}/><Info label="Son güncelleme" value={new Intl.DateTimeFormat("tr-TR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(selected?.externalModifiedAt||file.updatedAt))}/><Info label="Google Drive Sync Durumu" value={<StudioSyncStatus status={selected?.syncStatus??file.syncStatus}/>}/></dl><a href={downloadUrl} className={`${studioButtonClass("primary")} mt-6 w-full`}>Seçili Sürümü İndir</a></aside>
  </div>
 </section>;
}
