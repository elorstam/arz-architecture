import Image from "next/image";
import Link from "next/link";
import { StudioIconSurface, type StudioIconTone } from "@/components/studio/ui/StudioIconSurface";
import StudioFavoriteButton from "./StudioFavoriteButton";
import type { StudioQuickAccessItem } from "@/lib/studio/quick-access/quick-access-types";

const labels = { project: "Proje", crm_lead: "CRM", quote: "Teklif", file: "Dosya", folder: "Klasör", file_version: "Dosya Sürümü" } as const;
const iconFor = (type: StudioQuickAccessItem["entityType"]) => type === "folder" || type === "project" ? "folder" as const : type === "crm_lead" ? "clients" as const : type === "quote" ? "money" as const : "files" as const;
const toneFor = (type: StudioQuickAccessItem["entityType"]): StudioIconTone => type === "crm_lead" ? "slate" : "blue";

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
  return <article className="min-w-0 overflow-hidden rounded-xl border border-[#e3e9ef] bg-white shadow-[0_4px_18px_rgba(32,39,46,.03)]">
    {thumbnail ? <div className="relative aspect-[16/9] bg-[#f3f6fa]"><Image src={thumbnail} alt="" fill sizes="(max-width: 640px) 100vw, 360px" unoptimized className="object-cover" /></div> : null}
    <div className="p-4">
      <div className="flex min-w-0 items-start gap-3">
        {!thumbnail ? <StudioIconSurface icon={iconFor(item.entityType)} tone={toneFor(item.entityType)} size="md" /> : null}
        <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[.1em] text-[#927a4d]">{labels[item.entityType]}</p><h3 className="mt-1 break-words text-[15px] font-semibold text-[#283238]">{item.title}</h3><p className="mt-1 break-words text-[13px] text-[#707674]">{item.subtitle}</p></div>
        <StudioFavoriteButton entityType={item.entityType} entityId={item.entityId} initialFavorite={item.isFavorite} compact />
      </div>
      {item.lastOpenedAt ? <p className="mt-3 text-xs text-[#7d817e]">Son açılma: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.lastOpenedAt))}</p> : null}
      <Link href={item.url} className="mt-4 inline-flex min-h-10 items-center rounded-lg font-semibold text-[#795f2d] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#a58a56]/35">Kaydı Aç →</Link>
    </div>
  </article>;
}
