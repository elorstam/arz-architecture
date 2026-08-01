import {notFound} from "next/navigation";
import StudioFileDetail from "@/components/studio/files/StudioFileDetail";
import {getStudioProjectFileById,getStudioProjectFolders} from "@/lib/studio/files/file-repository";
import {getStudioFileVersions} from "@/lib/studio/files/versions/version-repository";
export const dynamic="force-dynamic";
export default async function FileDetailPage({params}:{params:Promise<{projectId:string;fileId:string}>}){const{projectId,fileId}=await params;const[result,folders,versions]=await Promise.all([getStudioProjectFileById(projectId,fileId),getStudioProjectFolders(projectId,"active"),getStudioFileVersions(projectId,fileId)]);if(!result)notFound();return <StudioFileDetail file={result.file} folders={folders} versions={versions}/>;}
