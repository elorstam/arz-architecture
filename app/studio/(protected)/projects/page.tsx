import StudioProjectsPage from "@/components/studio/projects/StudioProjectsPage";
import {PROJECT_STAGES,PROJECT_STATUSES} from "@/lib/studio/projects/project-constants";
import {getStudioProjectAccess,getStudioProjects} from "@/lib/studio/projects/project-repository";
import type {ProjectArchiveFilter} from "@/lib/studio/projects/project-types";
import StudioTagFilterForm from "@/components/studio/tags/StudioTagFilterForm";import{filterEntityIdsByTags}from"@/lib/studio/tags/tag-assignment-repository";
import{listUserFavoriteKeys}from"@/lib/studio/quick-access/quick-access-repository";

export const dynamic="force-dynamic";
type SearchParams=Promise<{q?:string;status?:string;stage?:string;archive?:string;tags?:string|string[];tagMode?:string;favorites?:string}>;
export default async function ProjectsPage({searchParams}:{searchParams:SearchParams}){
 const params=await searchParams;const query=params.q?.trim()||"";
 const status=PROJECT_STATUSES.find(value=>value===params.status);
 const stage=PROJECT_STAGES.find(value=>value===params.stage);
 const archive=(["active","archived","all"].includes(params.archive??"")?params.archive:"active") as ProjectArchiveFilter;
 const tagIds=(Array.isArray(params.tags)?params.tags:(params.tags??"").split(",")).filter(Boolean);const tagMode=params.tagMode==="all"?"all":"any";const[projects,allProjects,access,matched,favoriteKeys]=await Promise.all([getStudioProjects({query,status,stage,archive}),getStudioProjects({archive:"all"}),getStudioProjectAccess(),filterEntityIdsByTags("project",tagIds,tagMode),listUserFavoriteKeys()]);let filtered=matched?projects.filter(project=>matched.has(project.id)):projects;const favoritesOnly=params.favorites==="1";if(favoritesOnly)filtered=filtered.filter(project=>favoriteKeys.has(`project:${project.id}`));
 return <><StudioTagFilterForm selected={tagIds} mode={tagMode}/><StudioProjectsPage projects={filtered} totalCount={allProjects.length} canManage={access.canManage} favoriteKeys={favoriteKeys} filters={{query,status,stage,archive,favoritesOnly}}/></>;
}
