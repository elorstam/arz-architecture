import {StudioIcon, type StudioIconName} from "@/components/studio/StudioIcons";

const actions: Array<{label: string; description: string; icon: StudioIconName}> = [
  {label: "Yeni Proje", description: "Proje çalışma alanı oluştur", icon: "folder"},
  {label: "Müşteri Ekle", description: "Yeni müşteri kaydı başlat", icon: "clients"},
  {label: "Render Talebi Oluştur", description: "Görselleştirme ekibine ilet", icon: "render"},
  {label: "Teklif Hazırla", description: "Yeni teklif taslağı aç", icon: "money"},
];

export default function StudioQuickActions() {
  return (
    <section aria-labelledby="quick-actions-title" className="mt-5">
      <div className="mb-3 flex items-center gap-3">
        <h2 id="quick-actions-title" className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#747771]">Hızlı İşlemler</h2>
        <span className="rounded-full border border-[#ddd7cb] px-2 py-0.5 text-[7px] uppercase tracking-[.1em] text-[#a18d67]">Yakında</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <button key={action.label} type="button" disabled aria-disabled="true"
            title="Bu işlem yakında kullanıma açılacak"
            className="group flex min-w-0 items-center gap-3 rounded-xl border border-[#dedad1] bg-white p-4 text-left opacity-75 shadow-[0_4px_18px_rgba(32,39,46,.025)] disabled:cursor-not-allowed">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#e3ded3] bg-[#f4f1eb] text-[#8d7548]"><StudioIcon name={action.icon} className="h-4 w-4" /></span>
            <span className="min-w-0"><span className="block truncate text-[10px] font-semibold text-[#454c51]">{action.label}</span><span className="mt-1 block truncate text-[8px] text-[#9a9b96]">{action.description}</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}
