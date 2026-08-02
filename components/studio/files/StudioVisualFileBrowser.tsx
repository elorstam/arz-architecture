"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import StudioFavoriteButton from "@/components/studio/quick-access/StudioFavoriteButton";
import { studioButtonClass } from "@/components/studio/StudioButton";
import type { StudioProjectFile } from "@/lib/studio/files/file-types";
import type { StudioFileThumbnail } from "@/lib/studio/files/thumbnails/thumbnail-types";
import StudioFileTypeIcon from "./StudioFileTypeIcon";
import StudioSyncStatus from "./StudioSyncStatus";

type View = "grid" | "list";
const storageKey = "arz-studio-file-view";
const fileTypeLabels: Record<string, string> = { dwg: "DWG Çizimi", skp: "SketchUp Modeli", ifc: "BIM Modeli", zip: "Arşiv Dosyası", rar: "Arşiv Dosyası", pdf: "PDF Belgesi" };

function Thumbnail({ file, thumbnail }: { file: StudioProjectFile; thumbnail?: StudioFileThumbnail }) {
  const [loaded, setLoaded] = useState(false);
  if (!thumbnail || thumbnail.status !== "ready") {
    const loading = thumbnail?.status === "generating" || thumbnail?.status === "pending";
    return <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-t-xl bg-gradient-to-br from-[#eeeae2] to-[#ddd8ce]" aria-label={loading ? "Thumbnail yükleniyor" : `${file.extension.toUpperCase()} dosyası`}>
      {loading ? <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/50 to-transparent" role="status" aria-label="Thumbnail yükleniyor" /> : null}
      <StudioFileTypeIcon extension={file.extension} />
      <p className="absolute bottom-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#343b3f]">{fileTypeLabels[file.extension.toLowerCase()] ?? file.extension.toUpperCase()}</p>
    </div>;
  }
  return <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-[#e9e6df]">
    {!loaded ? <div className="absolute inset-0 animate-pulse bg-[#dedbd4]" role="status" aria-label="Thumbnail yükleniyor" /> : null}
    <Image src={thumbnail.url} alt={`${file.displayName} küçük önizlemesi`} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 360px" unoptimized loading="lazy" onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} className="object-cover" />
  </div>;
}

function Tags({ values }: { values: string[] }) {
  return values.length ? <div className="mt-2 flex flex-wrap gap-1.5">{values.slice(0, 3).map((tag) => <span key={tag} className="rounded-full border bg-[#f7f2e8] px-2 py-1 text-xs font-semibold">{tag}</span>)}{values.length > 3 ? <span className="text-xs">+{values.length - 3}</span> : null}</div> : null;
}

export default function StudioVisualFileBrowser({ projectId, files, favoriteKeys, thumbnails, tags, favoritesOnly = false }: { projectId: string; files: StudioProjectFile[]; favoriteKeys: string[]; thumbnails: Record<string, StudioFileThumbnail>; tags: Record<string, string[]>; favoritesOnly?: boolean }) {
  const [view, setView] = useState<View>("grid");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = localStorage.getItem(storageKey);
      if (stored === "grid" || stored === "list") setView(stored);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  function choose(next: View) { setView(next); localStorage.setItem(storageKey, next); }
  if (!files.length) return <p className="mt-3 rounded-xl border border-dashed p-8 text-center">{favoritesOnly ? "Bu klasörde favori dosya bulunmuyor." : "Bu klasör henüz boş."}</p>;
  return <>
    <div className="mt-3 flex justify-end gap-2" role="group" aria-label="Dosya görünümü"><button type="button" aria-pressed={view === "grid"} onClick={() => choose("grid")} className={studioButtonClass(view === "grid" ? "primary" : "outline", "sm")}>▦ Grid</button><button type="button" aria-pressed={view === "list"} onClick={() => choose("list")} className={studioButtonClass(view === "list" ? "primary" : "outline", "sm")}>☷ Liste</button></div>
    {view === "grid" ? <ul className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{files.map((file) => <li key={file.id} className="group relative min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm">
      <Thumbnail file={file} thumbnail={thumbnails[file.id]} />
      <div className="absolute right-3 top-3 z-10"><StudioFavoriteButton entityType="file" entityId={file.id} initialFavorite={favoriteKeys.includes(`file:${file.id}`)} compact /></div>
      <div className="p-4"><h3 className="break-words text-[15px] font-semibold">{file.displayName}</h3><p className="mt-1 text-sm text-[#707674]">V{file.versionNumber || 1}{file.revisionCode ? ` · ${file.revisionCode}` : ""} · {file.fileSizeLabel}</p><p className="mt-1 text-xs text-[#7b807d]">{file.uploadedBy.name} · {file.createdAtLabel}</p><Tags values={tags[file.id] ?? []} /><div className="mt-4 flex flex-wrap gap-2 border-t pt-3"><Link href={`/studio/projects/${projectId}/files/${file.id}`} className={studioButtonClass("outline", "sm")}>Önizle</Link><a href={`/studio/projects/${projectId}/files/${file.id}/download`} className={studioButtonClass("ghost", "sm")}>İndir</a><Link href={`/studio/projects/${projectId}/files/${file.id}#version-history-title`} className={studioButtonClass("ghost", "sm")}>Sürümler</Link><span title="Kalıcı veya herkese açık paylaşım kapalıdır" aria-label="Paylaşım kapalı" className="inline-flex items-center text-xs text-[#777]">Paylaşım kapalı</span></div></div>
    </li>)}</ul> : <ul className="mt-4 overflow-hidden rounded-xl border bg-white">{files.map((file) => <li key={file.id} className="relative border-b last:border-0"><div className="absolute right-3 top-3 z-10"><StudioFavoriteButton entityType="file" entityId={file.id} initialFavorite={favoriteKeys.includes(`file:${file.id}`)} compact /></div><Link href={`/studio/projects/${projectId}/files/${file.id}`} className="grid min-w-0 gap-3 p-4 pr-16 hover:bg-[#faf8f4] focus-visible:ring-2 sm:grid-cols-[auto_minmax(0,1fr)_130px_130px_160px]"><StudioFileTypeIcon extension={file.extension} /><div className="min-w-0"><p className="break-words font-semibold">{file.displayName}</p><Tags values={tags[file.id] ?? []} /></div><span>V{file.versionNumber || 1}</span><span>{file.fileSizeLabel}</span><StudioSyncStatus status={file.syncStatus} /></Link></li>)}</ul>}
  </>;
}
