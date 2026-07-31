import StudioProjectsPage from "@/components/studio/projects/StudioProjectsPage";
import {PROJECT_STAGES,PROJECT_STATUSES} from "@/lib/studio/projects/project-constants";
import {getStudioProjectAccess,getStudioProjects} from "@/lib/studio/projects/project-repository";
import type {ProjectArchiveFilter} from "@/lib/studio/projects/project-types";

export const dynamic="force-dynamic";
type SearchParams=Promise<{q?:string;status?:string;stage?:string;archive?:string}>;
export default async function ProjectsPage({searchParams}:{searchParams:SearchParams}){
 const params=await searchParams;const query=params.q?.trim()||"";
 const status=PROJECT_STATUSES.find(value=>value===params.status);
 const stage=PROJECT_STAGES.find(value=>value===params.stage);
 const archive=(["active","archived","all"].includes(params.archive??"")?params.archive:"active") as ProjectArchiveFilter;
 const[projects,allProjects,access]=await Promise.all([getStudioProjects({query,status,stage,archive}),getStudioProjects({archive:"all"}),getStudioProjectAccess()]);
 return <StudioProjectsPage projects={projects} totalCount={allProjects.length} canManage={access.canManage} filters={{query,status,stage,archive}}/>;
}
