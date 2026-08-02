import Link from "next/link";
import {StudioIcon} from "@/components/studio/StudioIcons";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {StudioPageHeader} from "@/components/studio/ui";
export default function StudioProjectsHeader({count,canManage}:{count:number;canManage:boolean}){
  return <StudioPageHeader eyebrow={`Proje Çalışma Alanı · ${count} proje`} title="Projeler" description="Tasarım kararlarını, proje aşamalarını ve yaklaşan teslimleri tek bir çalışma görünümünde izleyin." actions={canManage?<Link href="/studio/projects/new" className={studioButtonClass("primary")}><StudioIcon name="plus" className="h-4 w-4 text-[#d6bd87]"/>Yeni Proje</Link>:null} />;
}
