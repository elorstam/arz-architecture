"use client";

import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {StudioIcon, type StudioIconName} from "@/components/studio/StudioIcons";
import StudioLogoutButton from "@/components/studio/StudioLogoutButton";
import {StudioIconButton} from "@/components/studio/ui";

const navigation: Array<{label:string; icon:StudioIconName; href?:string; divider?:boolean}> = [
  {label:"Dashboard", icon:"dashboard", href: "/studio"},
  {label:"Hızlı Erişim", icon:"star", href: "/studio/quick-access"},
  {label:"Projeler", icon:"folder", href: "/studio/projects"},
  {label:"CRM", icon:"clients", href: "/studio/crm"},
  {label:"Teklifler", icon:"money", href: "/studio/quotes", divider:true},
  {label:"AI Kullanımı", icon: "chart", href: "/studio/ai-usage"},
  {label:"Takvim", icon:"calendar"},
  {label:"Dosyalar", icon:"files"},
  {label:"Finans", icon:"payments", href: "/studio/finance"},
];

type Props={open:boolean;onClose:()=>void;organizationName:string;userName:string;roleLabel:string};
function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map((part)=>part[0]?.toLocaleUpperCase("tr-TR")).join("");}

export default function StudioSidebar({open,onClose,organizationName,userName,roleLabel}:Props){
  const pathname=usePathname();
  const isActive=(href?:string)=>Boolean(href&&(pathname===href||(href!=="/studio"&&pathname.startsWith(`${href}/`))));
  return <>
    <button type="button" aria-label="Menüyü kapat" onClick={onClose} className={`studio-sidebar-overlay fixed inset-0 z-40 lg:hidden ${open?"is-open":""}`} />
    <aside aria-label="Studio ana menüsü" className={`studio-sidebar-v2 fixed inset-y-0 left-0 z-50 flex w-[282px] flex-col transition-transform duration-300 lg:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}>
      <div className="flex min-h-[104px] items-center justify-between border-b border-white/[.07] px-6 py-4">
        <Link href="/studio" onClick={onClose} aria-label="ARZ Studio dashboard" className="group flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#d4b777]/70">
          <Image src="/arz-logo-final.png" alt="ARZ" width={1254} height={1254} priority className="h-12 w-12 shrink-0 object-contain transition-opacity group-hover:opacity-85" />
          <span className="min-w-0 border-l border-white/15 pl-3"><span className="block text-[13px] font-semibold tracking-[.18em] text-white">ARZ STUDIO</span><span className="mt-1 block max-w-[145px] truncate text-[9px] font-medium uppercase tracking-[.16em] text-white/45">{organizationName||"ARZ MİMARLIK"}</span></span>
        </Link>
        <StudioIconButton icon="close" label="Menüyü kapat" variant="ghost" onClick={onClose} className="lg:hidden" />
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-7">
        <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[.2em] text-white/35">Çalışma Alanı</p>
        {navigation.map((item)=><div key={item.label}>
          {item.divider?<p className="mb-2 mt-7 px-3 text-[9px] font-semibold uppercase tracking-[.2em] text-white/35">Yönetim</p>:null}
          {item.href?<Link href={item.href} onClick={onClose} aria-current={isActive(item.href)?"page":undefined} className={`studio-nav-item group ${isActive(item.href)?"studio-nav-item-active":""}`}><StudioIcon name={item.icon} className="h-[18px] w-[18px] shrink-0"/><span className="truncate">{item.label}</span></Link>:<button type="button" disabled aria-disabled="true" title="Bu modül yakında kullanıma açılacak" className="studio-nav-item studio-nav-item-disabled"><StudioIcon name={item.icon} className="h-[18px] w-[18px] shrink-0"/><span className="truncate">{item.label}</span><span className="ml-auto rounded-full border border-white/10 bg-white/[.04] px-2 py-1 text-[7px] font-semibold uppercase tracking-[.08em] text-white/38">Yakında</span></button>}
        </div>)}
      </nav>
      <div className="border-t border-white/[.07] p-4"><div className="studio-sidebar-user flex items-center gap-3 rounded-xl p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#d4b777] text-[11px] font-semibold text-[#17202b]">{initials(userName)||"AR"}</span><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium text-white/90">{userName}</p><p className="mt-0.5 truncate text-[10px] text-white/45">{roleLabel}</p></div><StudioLogoutButton compact /></div></div>
    </aside>
  </>;
}
