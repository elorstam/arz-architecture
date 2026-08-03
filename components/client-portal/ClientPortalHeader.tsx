"use client";

import Image from "next/image";
import {Suspense} from "react";
import {useRouter} from "next/navigation";
import {StudioIcon} from "@/components/studio/StudioIcons";
import {StudioIconButton} from "@/components/studio/ui/StudioUiPrimitives";
import {StudioTooltip} from "@/components/studio/ui/StudioTooltip";
import type {ClientPortalProject} from "@/lib/client-portal/get-client-portal-context";
import ClientProjectSelector from "./ClientProjectSelector";

export default function ClientPortalHeader({projects,userName}:{projects:ClientPortalProject[];userName:string}){
 const router=useRouter();
 async function logout(){await fetch("/api/studio/auth/logout",{method:"POST"});router.replace("/studio/login");router.refresh()}
 return <header className="client-header"><div className="client-header__brand"><Image src="/arz-logo-final.png" alt="ARZ Mimarlık" width={112} height={36} priority/><span>Client Portal</span></div><div className="client-header__project"><Suspense fallback={<span className="client-project-name">{projects[0]?.name}</span>}><ClientProjectSelector projects={projects}/></Suspense></div><div className="client-header__actions"><StudioTooltip label="Bildirim merkezi yakında kullanıma açılacak"><span><StudioIconButton icon="notifications" label="Bildirimler yakında" variant="ghost" disabled/></span></StudioTooltip><details className="client-profile-menu"><summary aria-label="Profil menüsü"><span className="client-avatar" aria-hidden="true">{userName.trim().charAt(0).toLocaleUpperCase("tr-TR")}</span><span>{userName}</span><StudioIcon name="chevron-down" className="h-4 w-4"/></summary><div><p>Client Portal</p><button type="button" onClick={logout}><StudioIcon name="logout" className="h-4 w-4"/>Çıkış Yap</button></div></details></div></header>;
}
