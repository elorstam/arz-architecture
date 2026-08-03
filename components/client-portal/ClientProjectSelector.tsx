"use client";

import {usePathname,useRouter,useSearchParams} from "next/navigation";
import type {ClientPortalProject} from "@/lib/client-portal/get-client-portal-context";

export default function ClientProjectSelector({projects,className=""}:{projects:ClientPortalProject[];className?:string}){
 const router=useRouter(),pathname=usePathname(),params=useSearchParams();
 const requested=params.get("project");
 const selected=projects.some(project=>project.id===requested)?requested!:projects[0]?.id??"";
 if(projects.length<=1)return <span className={`client-project-name ${className}`}>{projects[0]?.name}</span>;
 return <label className={`client-project-selector ${className}`}><span className="sr-only">Aktif proje</span><select aria-label="Aktif proje" value={selected} onChange={event=>{const next=new URLSearchParams(params.toString());next.set("project",event.target.value);router.push(`${pathname}?${next.toString()}`)}}>{projects.map(project=><option value={project.id} key={project.id}>{project.name}</option>)}</select></label>;
}
