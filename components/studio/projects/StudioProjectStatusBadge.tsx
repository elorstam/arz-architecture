import type {ProjectStatus} from "@/components/studio/projects/StudioProjectData";

const styles: Record<ProjectStatus, string> = {
  Aktif: "border-[#c9d6cd] bg-[#f0f5f1] text-[#55705e]",
  Beklemede: "border-[#ddd7ca] bg-[#f6f3ed] text-[#776d5b]",
  Revizyon: "border-[#d8d7de] bg-[#f2f2f5] text-[#686877]",
  Gecikmiş: "border-[#e2cec5] bg-[#f8f0ed] text-[#925f4d]",
  Tamamlandı: "border-[#ccd7d7] bg-[#eef4f4] text-[#536c6d]",
  Arşivlendi: "border-[#deddda] bg-[#f3f3f1] text-[#7a7b77]",
};

export default function StudioProjectStatusBadge({status}: {status: ProjectStatus}) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[.08em] ${styles[status]}`}>{status}</span>;
}
