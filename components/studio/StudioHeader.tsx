"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {StudioIcon} from "@/components/studio/StudioIcons";
import {StudioIconButton} from "@/components/studio/ui";
import StudioCommandPalette from "@/components/studio/search/StudioCommandPalette";
import ThemeToggle from "@/components/ThemeToggle";
import {clientNavigationPath} from "@/lib/routing/app-domains";

export default function StudioHeader({onMenuOpen,userName}:{onMenuOpen:()=>void;userName:string}){
  const pathname=usePathname();
  return <header className="studio-shell-header sticky top-0 z-30">
    <div className="flex min-w-0 items-center gap-2">
      <StudioIconButton icon="menu" label="Menüyü aç" onClick={onMenuOpen} className="lg:hidden" />
      <div className="min-w-0 max-w-[420px] flex-1 sm:flex-none"><StudioCommandPalette /></div>
    </div>
    <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
      <ThemeToggle className="studio-theme-toggle" />
      <StudioIconButton icon="notifications" label="Bildirimler" variant="subtle" />
      <Link href={clientNavigationPath("studio","/studio/projects/new",pathname)} className={studioButtonClass("primary","md","px-3.5 sm:px-4")}>
        <StudioIcon name="plus" className="h-4 w-4 text-[#d6bd87]" />
        <span className="hidden sm:inline">Yeni Proje</span><span className="sm:hidden">Yeni</span>
      </Link>
      <div className="ml-1 hidden min-w-0 border-l border-[#d8d4cb] pl-4 xl:block">
        <p className="text-[10px] text-[#8b8b86]">Aktif kullanıcı</p>
        <p className="mt-0.5 max-w-[140px] truncate text-[12px] font-medium text-[#30363b]">{userName}</p>
      </div>
    </div>
  </header>;
}
