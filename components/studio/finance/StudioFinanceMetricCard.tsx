import type {StudioIconName} from "@/components/studio/StudioIcons";
import {StudioCard,StudioIconSurface,type StudioIconTone} from "@/components/studio/ui";

export default function StudioFinanceMetricCard({label,value,detail="Finans özeti",icon="wallet",tone="blue",negative=false}:{label:string;value:string;detail?:string;icon?:StudioIconName;tone?:StudioIconTone;negative?:boolean}){
 return <StudioCard as="article" className="p-0"><div className="flex min-h-[132px] flex-col p-4"><div className="flex items-center justify-between gap-3"><StudioIconSurface icon={icon} tone={tone} size="md"/><strong className={`truncate text-[27px] font-bold tracking-[-.045em] ${negative?"text-red-700":"text-[#26343d]"}`} title={value}>{value}</strong></div><h3 className="mt-3 text-[13px] font-semibold text-[#44515a]">{label}</h3><p className="mt-auto pt-1 text-[11px] text-[#8a949b]">{detail}</p></div></StudioCard>;
}
