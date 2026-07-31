import {notFound,redirect} from "next/navigation";

import {updateStudioProjectAction} from "@/app/studio/(protected)/projects/actions";
import StudioProjectArchiveControl from "@/components/studio/projects/StudioProjectArchiveControl";
import StudioProjectForm from "@/components/studio/projects/StudioProjectForm";
import {projectToFormValues} from "@/lib/studio/projects/project-mappers";
import {getStudioProjectAccess,getStudioProjectById,getStudioProjectMembers} from "@/lib/studio/projects/project-repository";

export const dynamic="force-dynamic";
export default async function EditProjectPage({params}:{params:Promise<{projectId:string}>}){
 const{projectId}=await params;const access=await getStudioProjectAccess();if(!access.canManage)redirect(`/studio/projects/${projectId}`);
 const[project,members]=await Promise.all([getStudioProjectById(projectId),getStudioProjectMembers()]);if(!project)notFound();
 if(project.isArchived)return <section className="mx-auto max-w-2xl px-4 py-16 text-center"><p className="text-[9px] uppercase tracking-[.16em] text-[#9a8253]">Arşivlenmiş Proje</p><h1 className="mt-3 text-[22px] font-semibold text-[#283138]">{project.name}</h1><p className="mt-3 text-[10px] leading-5 text-[#777b78]">Düzenleme yapmadan önce projeyi arşivden çıkarın.</p><div className="mt-6 flex justify-center"><StudioProjectArchiveControl projectId={project.id} archived/></div></section>;
 const action=updateStudioProjectAction.bind(null,projectId);
 return <section className="mx-auto min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
  <header className="mb-7 flex flex-col justify-between gap-4 border-b border-[#ddd8ce] pb-6 sm:flex-row sm:items-end"><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#9a8253]">Projeler / {project.code}</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.04em] text-[#1e272f]">Projeyi Düzenle</h1><p className="mt-2 text-[11px] text-[#747875]">{project.name}</p></div><StudioProjectArchiveControl projectId={project.id} archived={project.isArchived}/></header>
  <StudioProjectForm action={action} initialValues={projectToFormValues(project)} members={members} mode="edit" projectId={project.id}/>
 </section>;
}
