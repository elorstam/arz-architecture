import Link from "next/link";

const futureTabs = ["Revizyonlar", "Görevler", "Takvim", "Müşteri"] as const;
type ActiveTab = "overview" | "files" | "official-processes" | "stages" | "renders" | "finance";

export default function StudioProjectTabs({ projectId, active = "overview" }: { projectId: string; active?: ActiveTab }) {
  const links = [
    { id: "overview" as const, label: "Genel Bakış", href: `/studio/projects/${projectId}` },
    { id: "files" as const, label: "Dosyalar", href: `/studio/projects/${projectId}/files` },
    { id: "renders" as const, label: "Render Arşivi", href: `/studio/projects/${projectId}/renders` },
    { id: "official-processes" as const, label: "Harç ve Evraklar", href: `/studio/projects/${projectId}/official-processes` },
    { id: "stages" as const, label: "Proje Aşamaları", href: `/studio/projects/${projectId}/stages` },
    { id: "finance" as const, label: "Finans", href: `/studio/projects/${projectId}/finance` },
  ];
  return <nav aria-label="Proje bölümleri" className="mt-5 overflow-hidden rounded-xl border bg-white px-2"><div className="flex min-w-0 flex-wrap gap-1 py-2">{links.map((link) => <Link key={link.id} aria-current={active === link.id ? "page" : undefined} href={link.href} className={`rounded-lg px-3.5 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${active === link.id ? "studio-project-tab-active bg-[#1c2731] text-white hover:bg-[#273542]" : "text-[#665534] hover:bg-[#f3eee5]"}`}>{link.label}</Link>)}{futureTabs.map((tab) => <span key={tab} className="rounded-lg px-3.5 py-2 text-sm text-[#9b9b96]">{tab}<small className="ml-1">Yakında</small></span>)}</div></nav>;
}
