import type {StudioSyncStatus as SyncStatus} from "@/lib/studio/files/file-types";

const labels:Record<SyncStatus,string>={synced:"Senkronize",pending:"İşlem bekliyor",error:"Senkronizasyon hatası",action_required:"İşlem gerekli"};
const classes:Record<SyncStatus,string>={synced:"border-[#b9d2c3] bg-[#edf6f0] text-[#315c45]",pending:"border-[#dccca9] bg-[#faf5e9] text-[#715d35]",error:"border-[#e1bdb4] bg-[#fbefec] text-[#82483c]",action_required:"border-[#d9c18c] bg-[#fff6df] text-[#775d24]"};
export default function StudioSyncStatus({status}:{status:SyncStatus}){return <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-[13px] font-semibold ${classes[status]}`}><span className="mr-1.5" aria-hidden="true">{status==="synced"?"✓":"!"}</span>{labels[status]}</span>;}
