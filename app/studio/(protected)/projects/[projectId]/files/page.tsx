import {notFound} from "next/navigation";
import StudioProjectFilesPage from "@/components/studio/files/StudioProjectFilesPage";
import {getStudioProjectFileWorkspace} from "@/lib/studio/files/file-repository";
import {STUDIO_FILE_CATEGORIES} from "@/lib/studio/files/file-constants";
import type {StudioFileArchiveFilter} from "@/lib/studio/files/file-types";
export const dynamic="force-dynamic";
export default async function ProjectFilesPage({params,searchParams}:{params:Promise<{projectId:string}>;searchParams:Promise<{folder?:string;q?:string;category?:string;extension?:string;archive?:string}>}){
 const{projectId}=await params;const query=await searchParams;
 const workspace=await getStudioProjectFileWorkspace(projectId,{folderId:query.folder,query:query.q?.trim().slice(0,120),category:STUDIO_FILE_CATEGORIES.find(v=>v===query.category),extension:query.extension?.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,10),archive:(["active","archived","all"].includes(query.archive??"")?query.archive:"active") as StudioFileArchiveFilter}).catch(()=>notFound());
 return <StudioProjectFilesPage workspace={workspace}/>;
}
