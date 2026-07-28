import type {Metadata} from "next";
import {notFound, redirect} from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import {getManagedBySlug} from "@/lib/project-store";

type Props={params:Promise<{locale:string;slug:string}>};
export const dynamic='force-dynamic';
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale,slug}=await params; const managed=await getManagedBySlug(slug);
  if(!managed)return {title:locale==="tr"?"Proje Bulunamadı":"Project Not Found"};
  const project=locale==='tr'?managed.tr:managed.en; const segment=locale==="tr"?"projeler":"projects"; const canonicalSlug=locale==='tr'?managed.slugTr:managed.slugEn;
  return {title:project.title,description:project.description,alternates:{canonical:`/${locale}/${segment}/${canonicalSlug}`,languages:{tr:`/tr/projeler/${managed.slugTr}`,en:`/en/projects/${managed.slugEn}`}},openGraph:{title:project.title,description:project.description,url:`/${locale}/${segment}/${canonicalSlug}`,images:[{url:project.cover,alt:project.coverAlt}]},twitter:{card:"summary_large_image",title:project.title,description:project.description,images:[project.cover]}};
}
export default async function Page({params}:Props){const {locale,slug}=await params;const managed=await getManagedBySlug(slug);if(!managed||!managed.published)notFound();const canonicalSlug=locale==='tr'?managed.slugTr:managed.slugEn;if(slug!==canonicalSlug)redirect(`/${locale}/${locale==='tr'?'projeler':'projects'}/${canonicalSlug}`);return <ProjectDetail project={locale==='tr'?managed.tr:managed.en}/>;}
