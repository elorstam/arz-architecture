import {redirect} from "next/navigation";

import {createStudioProjectAction} from "@/app/studio/(protected)/projects/actions";
import StudioProjectForm from "@/components/studio/projects/StudioProjectForm";
import {getStudioProjectAccess,getStudioProjectMembers,listStudioProjectTypes} from "@/lib/studio/projects/project-repository";

export const dynamic="force-dynamic";
export default async function NewProjectPage(){
 const access=await getStudioProjectAccess();if(!access.canManage)redirect("/studio/projects");
 const[members,projectTypes]=await Promise.all([getStudioProjectMembers(),listStudioProjectTypes()]);
 return <section className="mx-auto min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
  <header className="mb-7 border-b border-[#ddd8ce] pb-6"><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#9a8253]">Projeler / Yeni</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.04em] text-[#1e272f]">Yeni Proje</h1><p className="mt-2 text-[11px] text-[#747875]">Projenin temel kimliğini, sürecini ve sorumlu ekip üyesini tanımlayın.</p></header>
  <StudioProjectForm action={createStudioProjectAction} members={members} projectTypes={projectTypes} mode="create"/>
 </section>;
}
