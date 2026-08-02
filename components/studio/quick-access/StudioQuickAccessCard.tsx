import Image from "next/image";
import Link from "next/link";
import { StudioIcon } from "@/components/studio/StudioIcons";
import StudioFavoriteButton from "./StudioFavoriteButton";
import type { StudioQuickAccessItem } from "@/lib/studio/quick-access/quick-access-types";

const labels = { project: "Proje", crm_lead: "CRM", quote: "Teklif", file: "Dosya", folder: "Klasör", file_version: "Dosya Sürümü" } as const;

function thumbnailUrl(item: StudioQuickAccessItem) {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  if (item.entityType === "file") return `${item.url}/thumbnail`;
  if (item.entityType === "file_version") {
    const match = item.url.match(/^(\/studio\/projects\/[^/]+\/files\/[^/]+)\/versions\/([^/?#]+)/);
    return match ? `${match[1]}/thumbnail?version=${match[2]}` : undefined;
  }
  return undefined;
}

export default function StudioQuickAccessCard({ item }: { item: StudioQuickAccessItem }) {
  const thumbnail = thumbnailUrl(item);
  return <article className="min-w-0 overflow-hidden rounded-xl border border-[#dedad1] bg-white shadow-[0_4px_18px_rgba(32,39,46,.03)]">
    {thumbnail ? <div className="relative aspect-[16/9] bg-[#e9e6df]"><Image src={thumbnail} alt="" fill sizes="(max-width: 640px) 100vw, 360px" unoptimized className="object-cover" /></div> : null}
    <div className="p-4">
      <div className="flex min-w-0 items-start gap-3">
        {!thumbnail ? <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f2eee5] text-[#8d7548]"><StudioIcon name={item.entityType === "folder" || item.entityType === "project" ? "folder" : item.entityType === "crm_lead" ? "clients" : item.entityType === "quote" ? "money" : "files"} className="h-5 w-5" /></span> : null}
        <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[.1em] text-[#927a4d]">{labels[item.entityType]}</p><h3 className="mt-1 break-words text-[15px] font-semibold text-[#283238]">{item.title}</h3><p className="mt-1 break-words text-[13px] text-[#707674]">{item.subtitle}</p></div>
        <StudioFavoriteButton entityType={item.entityType} entityId={item.entityId} initialFavorite={item.isFavorite} compact />
      </div>
      {item.lastOpenedAt ? <p className="mt-3 text-xs text-[#7d817e]">Son açılma: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.lastOpenedAt))}</p> : null}
      <Link href={item.url} className="mt-4 inline-flex min-h-10 items-center rounded-lg font-semibold text-[#795f2d] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#a58a56]/35">Kaydı Aç →</Link>
    </div>
  </article>;
}
