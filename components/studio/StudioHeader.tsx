"use client";

import {StudioIcon} from "@/components/studio/StudioIcons";

export default function StudioHeader({onMenuOpen, userName}: {
  onMenuOpen: () => void; userName: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex min-h-[82px] flex-wrap items-center gap-3 border-b border-[#ddd9d0] bg-[#f4f2ed]/95 px-4 py-3 backdrop-blur-md sm:h-[82px] sm:flex-nowrap sm:py-0 sm:px-6 lg:px-8">
      <button type="button" onClick={onMenuOpen} aria-label="Menüyü aç"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#d9d5cc] bg-white text-[#28313b] outline-none transition-colors hover:border-[#bfb8aa] focus-visible:ring-2 focus-visible:ring-[#9c8353]/35 lg:hidden">
        <StudioIcon name="menu" className="h-5 w-5" />
      </button>
      <label className="relative hidden w-full max-w-[420px] sm:block">
        <span className="sr-only">Studio içinde ara</span>
        <StudioIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8a8c8a]" />
        <input type="search" placeholder="Proje, müşteri veya dosya ara..."
          className="h-11 w-full rounded-lg border border-[#ddd9d0] bg-white pl-11 pr-4 text-[13px] text-[#22282e] outline-none placeholder:text-[#999a96] focus:border-[#ad9566] focus:ring-2 focus:ring-[#ad9566]/15" />
      </label>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button type="button" aria-label="Bildirimler"
          className="relative grid h-11 w-11 place-items-center rounded-lg border border-[#ddd9d0] bg-white text-[#4f565d] outline-none transition-colors hover:border-[#c8c1b4] hover:text-[#20272e] focus-visible:ring-2 focus-visible:ring-[#9c8353]/30">
          <StudioIcon name="notifications" className="h-[19px] w-[19px]" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#b39459]" />
        </button>
        <button type="button" disabled aria-disabled="true" title="Proje oluşturma yakında kullanıma açılacak"
          className="flex h-11 cursor-not-allowed items-center gap-2 rounded-lg bg-[#18222d] px-3.5 text-[12px] font-medium text-white opacity-90 shadow-sm sm:px-4">
          <StudioIcon name="plus" className="h-4 w-4 text-[#d6bd87]" />
          <span className="hidden sm:inline">Yeni Proje</span><span className="sm:hidden">Yeni</span>
        </button>
        <div className="ml-1 hidden border-l border-[#d8d4cb] pl-4 xl:block">
          <p className="text-[10px] text-[#8b8b86]">Aktif kullanıcı</p>
          <p className="mt-0.5 max-w-[140px] truncate text-[12px] font-medium text-[#30363b]">{userName}</p>
        </div>
      </div>
      <label className="relative order-last w-full sm:hidden">
        <span className="sr-only">Studio içinde ara</span>
        <StudioIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8c8a]" />
        <input type="search" placeholder="Studio içinde ara..."
          className="h-10 w-full rounded-lg border border-[#ddd9d0] bg-white pl-10 pr-4 text-[12px] text-[#22282e] outline-none placeholder:text-[#999a96] focus:border-[#ad9566] focus:ring-2 focus:ring-[#ad9566]/15" />
      </label>
    </header>
  );
}
