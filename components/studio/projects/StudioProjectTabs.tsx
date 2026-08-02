import StudioTabs from "@/components/studio/StudioTabs";

const futureTabs = ["Revizyonlar", "Görevler", "Takvim", "Müşteri"] as const;
type ActiveTab = "overview" | "files" | "official-processes" | "stages" | "renders" | "finance";

export default function StudioProjectTabs({projectId,active="overview"}:{projectId:string;active?:ActiveTab}){
  const links=[
    {href: `/studio/projects/${projectId}`,label:"Genel Bakış"},
    {href: `/studio/projects/${projectId}/files`,label:"Dosyalar"},
    {href: `/studio/projects/${projectId}/renders`,label:"Render Arşivi"},
    {href: `/studio/projects/${projectId}/official-processes`,label:"Harç ve Evraklar"},
    {href: `/studio/projects/${projectId}/stages`,label:"Proje Aşamaları"},
    {href: `/studio/projects/${projectId}/finance`,label:"Finans"},
  ];
  const activeHref=links[({overview:0,files:1,renders:2,"official-processes":3,stages:4,finance:5})[active]]?.href ?? links[0].href;
  return <div className="studio-project-tabs-v2" data-active-class="studio-project-tab-active" data-focus-visible="focus-visible"><StudioTabs items={links} active={activeHref} ariaLabel="Proje bölümleri" />{futureTabs.length>0?<div className="studio-project-tabs-future" aria-label="Yakında kullanılacak bölümler">{futureTabs.map((tab)=><span key={tab}>{tab}<small>Yakında</small></span>)}</div>:null}</div>;
}
