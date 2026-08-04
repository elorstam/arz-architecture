import Link from "next/link";
import { listOfficialProcesses, summarizeOfficialProcesses } from "@/lib/studio/official-processes/official-process-repository";

export default async function StudioOfficialProcessSummary({ projectId }: { projectId: string }) {
  let summary;
  try {
    summary = summarizeOfficialProcesses(await listOfficialProcesses(projectId));
  } catch {
    return (
      <section className="mt-5 rounded-xl border border-dashed border-[var(--studio-border)] bg-[var(--studio-workspace)] p-5" role="status">
        <h2 className="text-lg font-semibold">Harç ve Evraklar</h2>
        <p className="mt-2 text-sm text-[#68716f]">Modül henüz hazırlanmadı. Migration 014 uygulandıktan sonra süreç özeti burada görünecek.</p>
        <Link href={`/studio/projects/${projectId}/official-processes`} className="mt-3 inline-block text-sm font-semibold text-[#8a6c32] underline">Harç ve Evraklar sayfasını aç</Link>
      </section>
    );
  }
  const values = [["Bekleyen Harç", summary.pendingFees], ["Ödenen Harç", summary.paidFees], ["Alınan Evrak", summary.receivedDocuments], ["Bekleyen Evrak", summary.pendingDocuments], ["Geciken Süreç", summary.overdue], ["Aplikasyon", summary.applicationStatus], ["Temiz Aplikasyon", summary.cleanApplicationStatus]];
  return <section aria-labelledby="official-summary-title" className="mt-5 rounded-xl border bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="official-summary-title" className="text-xl font-semibold">Harç ve Evrak Özeti</h2><Link href={`/studio/projects/${projectId}/official-processes`} className="text-sm font-semibold text-[#8a6c32] underline">Tüm süreçleri aç</Link></div><dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">{values.map(([label,value])=><div key={label} className="rounded-lg bg-[#f8f5ef] p-3"><dt className="text-xs text-[#747b78]">{label}</dt><dd className="mt-1 text-base font-semibold">{value}</dd></div>)}</dl></section>;
}
