import {notFound} from "next/navigation";
import {getStudioProjectById} from "@/lib/studio/projects/project-repository";
import StudioProjectDetailHeader from "@/components/studio/projects/StudioProjectDetailHeader";
import StudioEntityTags from "@/components/studio/tags/StudioEntityTags";
import StudioProjectOverview from "@/components/studio/projects/StudioProjectOverview";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
export const dynamic="force-dynamic";
export default async function ProjectDetailPage({params}:{params:Promise<{projectId:string}>}){
 const{projectId}=await params;const project=await getStudioProjectById(projectId);if(!project)notFound();
 return <section className="mx-auto min-w-0 max-w-[1540px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9"><StudioProjectDetailHeader project={project}/><StudioEntityTags entityType="project" entityId={project.id}/><StudioProjectTabs projectId={project.id}/><StudioProjectOverview project={project}/></section>;
}
