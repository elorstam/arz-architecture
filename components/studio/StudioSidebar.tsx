"use client";

import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {StudioIcon, type StudioIconName} from "@/components/studio/StudioIcons";
import StudioLogoutButton from "@/components/studio/StudioLogoutButton";

const navigation: Array<{label: string; icon: StudioIconName; href?: string; divider?: boolean}> = [
  {label: "Dashboard", icon: "dashboard", href: "/studio"},
  {label: "Projeler", icon: "folder", href: "/studio/projects"},
  {label: "CRM", icon: "clients", href: "/studio/crm"},
  {label: "Teklifler", icon: "money", href: "/studio/quotes", divider: true},
  {label: "AI Kullanımı", icon: "chart", href: "/studio/ai-usage"},
  {label: "Takvim", icon: "calendar"},
  {label: "Dosyalar", icon: "files"},
  {label: "Finans", icon: "payments"},
];

type Props = {
  open: boolean; onClose: () => void; organizationName: string;
  userName: string; roleLabel: string;
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR")).join("");
}

export default function StudioSidebar({open, onClose, organizationName, userName, roleLabel}: Props) {
  const pathname = usePathname();

  return (
    <>
      <button type="button" aria-label="Menüyü kapat" onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#070b12]/60 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`} />
      <aside aria-label="Studio ana menüsü"
        className={`fixed inset-y-0 left-0 z-50 flex w-[282px] flex-col border-r border-white/[.07] bg-[#111923] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex min-h-[104px] items-center justify-between border-b border-white/[.07] px-6 py-4">
          <Link href="/studio" onClick={onClose} aria-label="ARZ Studio dashboard" className="group flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#d4b777]/70">
            <Image src="/arz-logo-final.png" alt="ARZ" width={1254} height={1254} priority className="h-12 w-12 shrink-0 object-contain transition-opacity group-hover:opacity-85" />
            <span className="min-w-0 border-l border-white/15 pl-3">
              <span className="block text-[13px] font-semibold tracking-[.18em] text-white">ARZ STUDIO</span>
              <span className="mt-1 block max-w-[145px] truncate text-[9px] font-medium uppercase tracking-[.16em] text-white/45">{organizationName || "ARZ MİMARLIK"}</span>
            </span>
          </Link>
          <button type="button" onClick={onClose} aria-label="Menüyü kapat"
            className="grid h-9 w-9 place-items-center text-white/50 hover:text-white lg:hidden">
            <StudioIcon name="close" className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[.2em] text-white/25">Çalışma Alanı</p>
          {navigation.map((item) => (
            <div key={item.label}>
              {item.divider ? <p className="mb-2 mt-7 px-3 text-[9px] font-semibold uppercase tracking-[.2em] text-white/25">Yönetim</p> : null}
              {item.href ? (
                <Link href={item.href} onClick={onClose}
                  aria-current={pathname === item.href || (item.href !== "/studio" && pathname.startsWith(`${item.href}/`)) ? "page" : undefined}
                  className={`group mb-1 flex h-11 items-center gap-3 rounded-lg px-3 text-[13px] outline-none focus-visible:ring-1 focus-visible:ring-[#d4b777]/60 ${
                    pathname === item.href || (item.href !== "/studio" && pathname.startsWith(`${item.href}/`))
                      ? "bg-white/[.09] text-white shadow-[inset_3px_0_0_#bda16a]"
                      : "text-white/58 transition-colors hover:bg-white/[.05] hover:text-white/85"
                  }`}>
                  <StudioIcon name={item.icon} className={`h-[18px] w-[18px] ${
                    pathname === item.href || (item.href !== "/studio" && pathname.startsWith(`${item.href}/`))
                      ? "text-[#d4b777]" : "text-white/38 group-hover:text-white/65"
                  }`} />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button type="button" disabled aria-disabled="true" title="Bu modül yakında kullanıma açılacak"
                  className="group mb-1 flex h-11 w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 text-left text-[13px] text-white/42">
                  <StudioIcon name={item.icon} className="h-[18px] w-[18px] text-white/38 group-hover:text-white/65" />
                  <span>{item.label}</span>
                  <span className="ml-auto rounded-full border border-white/10 bg-white/[.04] px-2 py-1 text-[7px] font-semibold uppercase tracking-[.08em] text-white/38">Yakında</span>
                </button>
              )}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/[.07] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[.035] p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#d4b777] text-[11px] font-semibold text-[#17202b]">{initials(userName) || "AR"}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-white/90">{userName}</p>
              <p className="mt-0.5 truncate text-[10px] text-white/35">{roleLabel}</p>
            </div>
            <StudioLogoutButton compact />
          </div>
        </div>
      </aside>
    </>
  );
}
