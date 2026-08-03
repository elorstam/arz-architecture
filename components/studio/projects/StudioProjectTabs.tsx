import StudioTabs from "@/components/studio/StudioTabs";
type ActiveTab = "overview" | "files" | "official-processes" | "stages" | "renders" | "finance";

export default function StudioProjectTabs({projectId,active="overview"}:{projectId:string;active?:ActiveTab}){
  const links=[
    {href: `/studio/projects/${projectId}`,label:"Genel Bakış",icon:"dashboard" as const},
    {href: `/studio/projects/${projectId}/files`,label:"Dosyalar",icon:"folder" as const},
    {href: `/studio/projects/${projectId}/renders`,label:"Render Arşivi",icon:"image" as const},
    {href: `/studio/projects/${projectId}/official-processes`,label:"Harç ve Evraklar",icon:"file-text" as const},
    {href: `/studio/projects/${projectId}/stages`,label:"Proje Aşamaları",icon:"activity" as const},
    {href: `/studio/projects/${projectId}/finance`,label:"Finans",icon:"wallet" as const},
    {label:"Revizyonlar",icon:"revision" as const,badge:"Yakında",disabled:true},
    {label:"Görevler",icon:"check" as const,badge:"Yakında",disabled:true},
    {label:"Takvim",icon:"calendar" as const,badge:"Yakında",disabled:true},
    {label:"Müşteri",icon:"clients" as const,badge:"Yakında",disabled:true},
  ];
  const activeHref=links[({overview:0,files:1,renders:2,"official-processes":3,stages:4,finance:5})[active]]?.href ?? `/studio/projects/${projectId}`;
  return <div className="studio-project-tabs-v2" data-active-class="studio-project-tab-active" data-focus-visible="focus-visible"><StudioTabs items={links} active={activeHref} ariaLabel="Proje bölümleri" variant="workspace-navigation"/></div>;
}
