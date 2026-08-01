import Link from "next/link";

import {studioButtonClass} from "@/components/studio/StudioButton";
import StudioLeadArchiveControl from "@/components/studio/crm/StudioLeadArchiveControl";
import {StudioLeadStageBadge, StudioLeadStatusBadge} from "@/components/studio/crm/StudioLeadBadge";
import type {StudioLead} from "@/lib/studio/crm/lead-types";
import type {StudioQuote} from "@/lib/studio/quotes/quote-types";

function budget(lead: StudioLead) {
  return lead.budgetAmount
    ? new Intl.NumberFormat("tr-TR", {style: "currency", currency: lead.budgetCurrency}).format(Number(lead.budgetAmount))
    : "Belirtilmedi";
}

function Item({label, value}: {label: string; value: string}) {
  return <div className="min-w-0">
    <dt className="studio-meta-label">{label}</dt>
    <dd className="studio-meta-value mt-2 break-words">{value || "Belirtilmedi"}</dd>
  </div>;
}

function Card({title, children}: {title: string; children: React.ReactNode}) {
  return <section className="studio-card p-6 sm:p-7">
    <h2 className="studio-card__title border-b border-[#ece9e3] pb-5">{title}</h2>
    <dl className="mt-6 grid gap-x-6 gap-y-7 sm:grid-cols-2">{children}</dl>
  </section>;
}

export default function StudioLeadDetail({lead, quotes}: {lead: StudioLead; quotes: StudioQuote[]}) {
  return <section className="mx-auto min-w-0 max-w-[1280px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
    <header className="studio-card p-6 sm:p-8">
      <Link href="/studio/crm" className="studio-helper-text font-semibold uppercase tracking-[.12em] text-[#806b45] outline-none">← CRM’e Dön</Link>
      <div className="mt-6 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2.5"><StudioLeadStageBadge stage={lead.stage}/><StudioLeadStatusBadge status={lead.status}/>{lead.isArchived ? <span className="rounded-full border border-[#dfcbc0] bg-[#f8f0ec] px-3 py-1.5 text-[13px] font-medium text-[#8c604e]">Arşiv</span> : null}</div>
          <h1 className="mt-5 break-words font-semibold text-[#1f2930]">{lead.fullName}</h1>
          <p className="mt-3 text-sm text-[#69706e]">{lead.companyName || "Bireysel müşteri"} · {lead.serviceType}</p>
        </div>
        {lead.canManage ? <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          {!lead.isArchived ? <>
            <Link href={`/studio/quotes/new?leadId=${lead.id}`} className={studioButtonClass("outline", "md")}>Teklif Oluştur</Link>
            <Link href={`/studio/crm/${lead.id}/edit`} className={studioButtonClass("primary", "md")}>Düzenle</Link>
          </> : null}
          <StudioLeadArchiveControl leadId={lead.id} archived={lead.isArchived}/>
        </div> : null}
      </div>
    </header>

    <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
      <Card title="İletişim"><Item label="Telefon" value={lead.phone}/><Item label="E-posta" value={lead.email}/></Card>
      <Card title="Konum"><Item label="Şehir" value={lead.city}/><Item label="İlçe" value={lead.district}/></Card>
      <Card title="Hizmet"><Item label="Hizmet Tipi" value={lead.serviceType}/><Item label="Tahmini Bütçe" value={budget(lead)}/><Item label="Kaynak" value={lead.source}/></Card>
      <Card title="Süreç"><Item label="Sorumlu" value={lead.assignedUser?.name || ""}/><Item label="Son Görüşme" value={lead.lastContactLabel}/><Item label="Sonraki Takip" value={lead.nextFollowUpLabel}/></Card>

      <section className="studio-card p-6 sm:p-7 lg:col-span-2">
        <h2 className="studio-section-title">Notlar</h2>
        <p className="mt-5 whitespace-pre-wrap break-words text-base leading-7 text-[#525c60]">{lead.notes || "Bu lead için not eklenmemiş."}</p>
      </section>

      <Card title="Kayıt Bilgileri"><Item label="Oluşturulma" value={lead.createdAtLabel}/><Item label="Güncellenme" value={lead.updatedAtLabel}/></Card>
      <section className="studio-card p-6 sm:p-7">
        <h2 className="studio-section-title">Bu Lead’e Ait Teklifler</h2>
        {quotes.length ? <div className="mt-5 space-y-3">{quotes.slice(0, 4).map((quote) => <Link key={quote.id} href={`/studio/quotes/${quote.id}`} className="flex min-h-12 items-center justify-between gap-4 rounded-lg border border-[#e7e3dc] px-4 py-3 text-[15px] font-medium text-[#465055] transition-colors hover:border-[#cfc5b4] hover:bg-[#faf8f4]"><span className="truncate">{quote.quoteNumber} · {quote.title}</span><span className="shrink-0 text-[13px] text-[#707774]">{quote.status}</span></Link>)}</div> : <p className="studio-helper-text mt-4">Bu lead için henüz teklif oluşturulmadı.</p>}
      </section>
    </div>
  </section>;
}
