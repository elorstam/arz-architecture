import {StudioIcon} from "@/components/studio/StudioIcons";
import Link from "next/link";

export default function StudioProjectsHeader({count,canManage}: {count: number;canManage:boolean}) {
  return (
    <header className="flex flex-col justify-between gap-5 border-b border-[#ddd8ce] pb-7 sm:flex-row sm:items-end">
      <div>
        <div className="flex items-center gap-3"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#9a8253]">Proje Çalışma Alanı</p><span className="rounded-full border border-[#ddd6c8] bg-[#f8f5ef] px-2 py-0.5 text-[8px] text-[#806d49]">{count} proje</span></div>
        <h1 className="mt-2.5 text-[28px] font-semibold tracking-[-.04em] text-[#1e272f] sm:text-[32px]">Projeler</h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-5 text-[#747875]">Tasarım kararlarını, proje aşamalarını ve yaklaşan teslimleri tek bir çalışma görünümünde izleyin.</p>
      </div>
      {canManage?<Link href="/studio/projects/new" className="flex h-10 w-fit items-center gap-2 rounded-lg bg-[#18222d] px-4 text-[11px] font-medium text-white outline-none hover:bg-[#222e3a] focus-visible:ring-2 focus-visible:ring-[#9e8452]/40"><StudioIcon name="plus" className="h-4 w-4 text-[#d6bd87]"/>Yeni Proje</Link>:null}
    </header>
  );
}
