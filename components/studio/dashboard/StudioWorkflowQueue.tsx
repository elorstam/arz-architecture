import {StudioIcon} from "@/components/studio/StudioIcons";
import type {WorkflowItem} from "@/components/studio/dashboard/StudioDashboardData";

function QueueList({items}: {items: WorkflowItem[]}) {
  return (
    <div className="divide-y divide-[#efede8]">
      {items.map((item) => (
        <article key={`${item.project}-${item.item}`} className="px-5 py-4 transition-colors hover:bg-[#fbfaf7]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><p className="truncate text-[11px] font-semibold text-[#30383e]">{item.project}</p><p className="mt-1 truncate text-[9px] text-[#8e908c]">{item.item}</p></div>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f1ede5] text-[8px] font-semibold text-[#7f6940]">{item.owner}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full border border-[#dfdad0] bg-[#f8f6f1] px-2 py-1 text-[8px] text-[#656965]">{item.state}</span>
            <span className={`text-[8px] ${item.due.includes("gecikti") ? "font-semibold text-[#9a614d]" : "text-[#999a95]"}`}>{item.due}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function StudioWorkflowQueue({revisions, renders}: {
  revisions: WorkflowItem[];
  renders: WorkflowItem[];
}) {
  return (
    <section aria-label="Revizyon ve render iş akışı" className="studio-dashboard-workflow grid overflow-hidden rounded-xl border border-[#dedad1] bg-white shadow-[0_4px_18px_rgba(32,39,46,.03)] lg:grid-cols-2">
      <div className="border-b border-[#e9e6df] lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b border-[#ece9e3] px-5 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f3eee5] text-[#8d7548]"><StudioIcon name="revision" className="h-4 w-4" /></span>
          <div><h2 className="text-[13px] font-semibold text-[#2d353b]">Bekleyen Revizyonlar</h2><p className="mt-0.5 text-[9px] text-[#989994]">3 açık iş</p></div>
        </div>
        <QueueList items={revisions} />
      </div>
      <div>
        <div className="flex items-center gap-3 border-b border-[#ece9e3] px-5 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf0f1] text-[#63747c]"><StudioIcon name="render" className="h-4 w-4" /></span>
          <div><h2 className="text-[13px] font-semibold text-[#2d353b]">Render Kuyruğu</h2><p className="mt-0.5 text-[9px] text-[#989994]">3 güncel çalışma</p></div>
        </div>
        <QueueList items={renders} />
      </div>
    </section>
  );
}
