import type {ProjectStatus} from "@/components/studio/projects/StudioProjectData";
import {StudioBadge} from "@/components/studio/ui";

const variants:Record<ProjectStatus,"success"|"warning"|"info"|"danger"|"neutral"|"archived">={
 Aktif:"success",Beklemede:"warning",Revizyon:"info",Gecikmiş:"danger",Tamamlandı:"neutral",Arşivlendi:"archived",
};

export default function StudioProjectStatusBadge({status}:{status:ProjectStatus}){
 return <StudioBadge variant={variants[status]}>{status}</StudioBadge>;
}
