import { STATUS_LABELS, type OfficialProcessStatus } from "@/lib/studio/official-processes/official-process-types";

const styles: Record<OfficialProcessStatus, string> = {
  waiting: "border-[#d8d2c7] bg-[#f7f4ee] text-[#655f56]",
  assessment_uploaded: "border-blue-200 bg-blue-50 text-blue-800",
  client_notified: "border-purple-200 bg-purple-50 text-purple-800",
  payment_waiting: "border-amber-200 bg-amber-50 text-amber-900",
  receipt_uploaded: "border-cyan-200 bg-cyan-50 text-cyan-900",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-800",
  document_received: "border-teal-200 bg-teal-50 text-teal-900",
  cancelled: "border-slate-200 bg-slate-100 text-slate-700",
};

export default function StudioOfficialProcessStatusBadge({ status }: { status: OfficialProcessStatus }) {
  return <span className={`max-w-full rounded-full border px-2.5 py-1 text-xs font-semibold leading-5 ${styles[status]}`}>{STATUS_LABELS[status]}</span>;
}

export function StudioOverdueBadge() {
  return <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">Gecikti</span>;
}
