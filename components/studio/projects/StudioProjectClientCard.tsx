import type {StudioProject} from "@/components/studio/projects/StudioProjectData";

export default function StudioProjectClientCard({client}: {client: StudioProject["client"]}) {
  return (
    <section aria-labelledby="client-title" className="rounded-xl border border-[#dedad1] bg-white p-5 shadow-[0_4px_18px_rgba(32,39,46,.03)]">
      <div className="flex items-center justify-between gap-3"><h2 id="client-title" className="text-[13px] font-semibold text-[#2d353b]">Müşteri</h2><span className="text-[7px] uppercase tracking-[.1em] text-[#ad966a]">Portal yakında</span></div>
      <p className="mt-4 text-[11px] font-semibold text-[#444c50]">{client.name}</p>
      <dl className="mt-3 space-y-2 text-[8px]">
        <div><dt className="text-[#aaa69e]">İletişim</dt><dd className="mt-0.5 text-[#6d7271]">{client.contact}</dd></div>
        <div><dt className="text-[#aaa69e]">E-posta</dt><dd className="mt-0.5 break-all text-[#6d7271]">{client.email}</dd></div>
        <div><dt className="text-[#aaa69e]">Telefon</dt><dd className="mt-0.5 text-[#6d7271]">{client.phone}</dd></div>
      </dl>
    </section>
  );
}
