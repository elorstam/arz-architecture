"use client";
import {useState,useTransition} from "react";
import {archiveFolderAction,moveFolderAction,renameFolderAction} from "@/app/studio/(protected)/projects/[projectId]/files/actions";
import {studioButtonClass} from "@/components/studio/StudioButton";
import type {StudioProjectFolder} from "@/lib/studio/files/file-types";

export default function StudioFolderActions({projectId,folder,folders=[]}:{projectId:string;folder:StudioProjectFolder;folders?:StudioProjectFolder[]}) {
  const [editing,setEditing]=useState(false); const [pending,start]=useTransition();
  if(folder.isSystem)return <span className="text-[8px] uppercase tracking-[.1em] text-[#9b8253]">Sistem</span>;
  if(editing)return <div className="space-y-2">
    <form action={form=>start(async()=>{await renameFolderAction(projectId,folder.id,form);setEditing(false);})} className="flex min-w-0 gap-2"><input name="name" defaultValue={folder.name} maxLength={120} aria-label="Yeni klasör adı" className="h-9 min-w-0 flex-1 rounded-md border px-2 text-xs"/><button disabled={pending} className={studioButtonClass("secondary","sm")}>Kaydet</button></form>
    <form action={form=>start(async()=>{await moveFolderAction(projectId,folder.id,form);setEditing(false);})} className="flex min-w-0 gap-2"><label className="sr-only" htmlFor={`move-${folder.id}`}>Üst klasör</label><select id={`move-${folder.id}`} name="parentFolderId" defaultValue={folder.parentFolderId} className="h-9 min-w-0 flex-1 rounded-md border bg-white px-2 text-xs"><option value="">Kök</option>{folders.filter(value=>value.id!==folder.id&&!value.isArchived).map(value=><option key={value.id} value={value.id}>{value.name}</option>)}</select><button disabled={pending} className={studioButtonClass("outline","sm")}>Taşı</button></form>
  </div>;
  return <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>setEditing(true)} className={studioButtonClass("ghost","sm")}>Yeniden Adlandır / Taşı</button><button type="button" disabled={pending} onClick={()=>{if(window.confirm(folder.isArchived?"Klasör arşivden çıkarılsın mı?":"Klasör arşivlensin mi? İçindeki dosyalar silinmez."))start(()=>archiveFolderAction(projectId,folder.id,!folder.isArchived));}} className={studioButtonClass("danger","sm")}>{folder.isArchived?"Geri Yükle":"Arşivle"}</button></div>;
}
