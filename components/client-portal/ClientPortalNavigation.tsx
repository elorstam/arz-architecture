import StudioTabs from "@/components/studio/StudioTabs";

const items=[
 {href:"/client",label:"Genel Bakış",icon:"dashboard" as const},
 {label:"Proje Aşamaları",icon:"activity" as const,badge:"Yakında",disabled:true},
 {label:"Renderlar",icon:"render" as const,badge:"Yakında",disabled:true},
 {label:"Dosyalar",icon:"files" as const,badge:"Yakında",disabled:true},
 {label:"Evraklar",icon:"file-text" as const,badge:"Yakında",disabled:true},
 {label:"Finans / Ödemeler",icon:"payments" as const,badge:"Yakında",disabled:true},
 {label:"Bildirimler",icon:"notifications" as const,badge:"Yakında",disabled:true},
 {label:"Profil",icon:"user" as const,badge:"Yakında",disabled:true},
] as const;

export default function ClientPortalNavigation(){return <StudioTabs items={items} active="/client" ariaLabel="Client Portal navigasyonu" variant="workspace-navigation"/>}
