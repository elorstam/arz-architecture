"use client";

import Image from "next/image";
import {Suspense} from "react";
import {usePathname,useRouter} from "next/navigation";

import {StudioIcon} from "@/components/studio/StudioIcons";
import {StudioIconButton} from "@/components/studio/ui/StudioUiPrimitives";
import {StudioTooltip} from "@/components/studio/ui/StudioTooltip";
import type {ClientPortalProject} from "@/lib/client-portal/get-client-portal-context";
import {clientNavigationPath} from "@/lib/routing/app-domains";
import ClientProjectSelector from "./ClientProjectSelector";

export default function ClientPortalHeader({projects,userName,unreadCount}:{projects:ClientPortalProject[];userName:string;unreadCount:number}){
  const router=useRouter();
  const pathname=usePathname();
  const path=(value:string)=>clientNavigationPath("client",value,pathname);
  async function logout(){const response=await fetch("/api/client/auth/logout",{method:"POST"});const result=await response.json().catch(()=>({}));router.replace(result.destination||path("/client/login"));router.refresh();}
  function openNotifications(){const project=new URLSearchParams(window.location.search).get("project"),target=path("/client/notifications");router.push(project?`${target}?project=${encodeURIComponent(project)}`:target);}
  return <header className="client-header"><div className="client-header__brand"><Image src="/arz-logo-final.png" alt="ARZ Mimarlık" width={112} height={36} priority/><span className="client-header__portal-name">Client Portal <small>v1</small></span></div><div className="client-header__project"><Suspense fallback={<span className="client-project-name">{projects[0]?.name}</span>}><ClientProjectSelector projects={projects}/></Suspense></div><div className="client-header__actions"><StudioTooltip label="Bildirim Merkezi"><span className="client-notification-trigger"><StudioIconButton icon="notifications" label={unreadCount?`Bildirimler, ${unreadCount} okunmamış`:"Bildirimler"} variant="ghost" onClick={openNotifications}/>{unreadCount?<span className="client-notification-badge" aria-hidden="true">{unreadCount>99?"99+":unreadCount}</span>:null}</span></StudioTooltip><details className="client-profile-menu"><summary aria-label="Profil menüsü"><span className="client-avatar" aria-hidden="true">{userName.trim().charAt(0).toLocaleUpperCase("tr-TR")}</span><span>{userName}</span><StudioIcon name="chevron-down" className="h-4 w-4"/></summary><div><p>Client Portal</p><button type="button" onClick={logout}><StudioIcon name="logout" className="h-4 w-4"/>Çıkış Yap</button></div></details></div></header>;
}
