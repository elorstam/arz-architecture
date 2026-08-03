"use client";
import {usePathname,useSearchParams} from "next/navigation";
import StudioTabs from "@/components/studio/StudioTabs";

const items=[
 {href:"/client",label:"Genel Bakış",icon:"dashboard" as const},
 {href:"/client/stages",label:"Proje Aşamaları",icon:"activity" as const},
 {href:"/client/renders",label:"Renderlar",icon:"render" as const},
 {label:"Dosyalar",icon:"files" as const,badge:"Yakında",disabled:true},
 {label:"Evraklar",icon:"file-text" as const,badge:"Yakında",disabled:true},
 {label:"Finans / Ödemeler",icon:"payments" as const,badge:"Yakında",disabled:true},
 {label:"Bildirimler",icon:"notifications" as const,badge:"Yakında",disabled:true},
 {label:"Profil",icon:"user" as const,badge:"Yakında",disabled:true},
] as const;

export default function ClientPortalNavigation(){const pathname=usePathname(),searchParams=useSearchParams(),project=searchParams.get("project");const withProject=items.map(item=>"href" in item?{...item,href:project?`${item.href}?project=${encodeURIComponent(project)}`:item.href}:item);return <StudioTabs items={withProject} active={project?`${pathname}?project=${encodeURIComponent(project)}`:pathname} ariaLabel="Client Portal navigasyonu" variant="workspace-navigation"/>}
