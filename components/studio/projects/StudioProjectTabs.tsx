const tabs = ["Genel Bakış", "Dosyalar", "Renderlar", "Revizyonlar", "Görevler", "Takvim", "Müşteri", "Finans"] as const;

export default function StudioProjectTabs() {
  return (
    <nav aria-label="Proje bölümleri" className="mt-5 overflow-hidden rounded-xl border border-[#dedad1] bg-white px-2 shadow-[0_4px_18px_rgba(32,39,46,.025)]">
      <div className="flex min-w-0 flex-wrap gap-1 py-2">
        {tabs.map((tab, index) => index === 0 ? (
          <span key={tab} aria-current="page" className="rounded-lg bg-[#1c2731] px-3.5 py-2 text-[9px] font-semibold text-white">{tab}</span>
        ) : (
          <span key={tab} title="Bu bölüm yakında kullanıma açılacak"
            className="flex cursor-not-allowed items-center gap-1.5 rounded-lg px-3.5 py-2 text-[9px] text-[#9b9b96]">
            {tab}<span className="text-[6px] uppercase tracking-[.08em] text-[#b3a07c]">Yakında</span>
          </span>
        ))}
      </div>
    </nav>
  );
}
