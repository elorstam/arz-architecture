import "server-only";

import {getStudioContext} from "@/lib/studio/auth/get-studio-context";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import {StudioFileError} from "../file-errors";
import {getDriveFileMetadata} from "./google-drive-provider";
import {initializeStudioProjectDriveStorage} from "./google-drive-mapping";

export async function initializeStudioProjectDriveStorageIfReady(projectId:string){
 const ctx=await getStudioContext();
 if(!ctx?.membership||ctx.membership.role!=="owner")throw new StudioFileError("forbidden","Bu işlem yalnızca Studio sahibi tarafından yapılabilir.");
 const organizationId=ctx.membership.organization_id;
 const supabase=await createStudioServerClient();
 const{data:connection,error:connectionError}=await supabase.from("studio_storage_connections").select("status,root_folder_id,projects_folder_id").eq("organization_id",organizationId).eq("provider","google_drive").maybeSingle();
 if(connectionError){await supabase.from("studio_projects").update({storage_sync_status:"error"}).eq("id",projectId).eq("organization_id",organizationId);return{status:"failed" as const};}
 if(connection?.status!=="connected"||!connection.root_folder_id||!connection.projects_folder_id)return{status:"skipped" as const};
 try{
  const[root,projects]=await Promise.all([getDriveFileMetadata(organizationId,connection.root_folder_id),getDriveFileMetadata(organizationId,connection.projects_folder_id)]);
  if(root.trashed||projects.trashed||!projects.parents.includes(root.id))throw new StudioFileError("storage","Google Drive root eşlemesi geçerli değil.");
  await initializeStudioProjectDriveStorage(projectId);
  return{status:"initialized" as const};
 }catch{
  await supabase.from("studio_projects").update({storage_sync_status:"error",storage_last_synced_at:new Date().toISOString()}).eq("id",projectId).eq("organization_id",organizationId);
  return{status:"failed" as const};
 }
}
