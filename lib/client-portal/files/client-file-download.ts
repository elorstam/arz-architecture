import "server-only";

import {createClient} from "@supabase/supabase-js";

import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import {STUDIO_FILES_BUCKET,STUDIO_FILE_SIGNED_URL_SECONDS} from "@/lib/studio/files/file-constants";
import {safeDownloadName} from "@/lib/studio/files/file-paths";
import {googleDriveStorageProvider} from "@/lib/studio/files/storage/google-drive-provider";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

export class ClientFileDownloadError extends Error {
 constructor(readonly status:401|404|503){super(status===401?"Oturum gerekli.":status===404?"Dosya bulunamadı.":"Dosya geçici olarak indirilemiyor.");}
}

type VisibleFile={id:string;project_id:string};
type FileRow={id:string;organization_id:string;project_id:string;display_name:string;status:string;is_archived:boolean;current_version_id:string|null};
type VersionRow={id:string;organization_id:string;project_id:string;file_id:string;status:string;is_current:boolean;storage_provider:string;storage_bucket:string|null;storage_path:string|null;external_file_id:string|null;external_parent_folder_id:string|null;original_file_name:string};

function privilegedClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new ClientFileDownloadError(503);
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}

async function visibleFile(fileId:string){
 const context=await getClientPortalContext();
 if(!context?.user)throw new ClientFileDownloadError(401);
 if(!context.membership)throw new ClientFileDownloadError(404);
 const db=await createStudioServerClient();
 for(const project of context.projects){
  const{data,error}=await db.rpc("client_portal_list_files",{p_project_id:project.id});
  if(error){console.error("CLIENT_FILE_DOWNLOAD_AUTHORIZATION_FAILED",{code:error.code});throw new ClientFileDownloadError(503);}
  const match=(data as VisibleFile[]|null)?.find(file=>file.id===fileId);
  if(match)return{context,projectId:match.project_id};
 }
 throw new ClientFileDownloadError(404);
}

export async function createClientFileDownload(fileId:string){
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(fileId))throw new ClientFileDownloadError(404);
 const authorized=await visibleFile(fileId);
 const admin=privilegedClient();
 const{data:file,error:fileError}=await admin.from("studio_project_files").select("id,organization_id,project_id,display_name,status,is_archived,current_version_id").eq("id",fileId).eq("project_id",authorized.projectId).eq("organization_id",authorized.context.membership!.organization_id).eq("status","ready").eq("is_archived",false).maybeSingle<FileRow>();
 if(fileError){console.error("CLIENT_FILE_DOWNLOAD_FILE_LOOKUP_FAILED",{code:fileError.code});throw new ClientFileDownloadError(503);}
 if(!file?.current_version_id)throw new ClientFileDownloadError(404);
 const{data:version,error:versionError}=await admin.from("studio_project_file_versions").select("id,organization_id,project_id,file_id,status,is_current,storage_provider,storage_bucket,storage_path,external_file_id,external_parent_folder_id,original_file_name").eq("id",file.current_version_id).eq("file_id",file.id).eq("project_id",file.project_id).eq("organization_id",file.organization_id).eq("status","ready").eq("is_current",true).maybeSingle<VersionRow>();
 if(versionError){console.error("CLIENT_FILE_DOWNLOAD_VERSION_LOOKUP_FAILED",{code:versionError.code});throw new ClientFileDownloadError(503);}
 if(!version)throw new ClientFileDownloadError(404);
 const fileName=safeDownloadName(file.display_name||version.original_file_name);
 if(version.storage_provider==="google_drive"){
  if(!version.external_file_id||!version.external_parent_folder_id)throw new ClientFileDownloadError(404);
  const verified=await googleDriveStorageProvider.verifyFileExists(file.organization_id,version.external_file_id);
  if(!verified.exists||!verified.metadata||verified.metadata.trashed||!verified.metadata.parents.includes(version.external_parent_folder_id))throw new ClientFileDownloadError(404);
  return{response:await googleDriveStorageProvider.downloadFile(file.organization_id,version.external_file_id),fileName};
 }
 if(version.storage_provider!=="supabase"||version.storage_bucket!==STUDIO_FILES_BUCKET||!version.storage_path)throw new ClientFileDownloadError(404);
 const{data:signed,error:signedError}=await admin.storage.from(STUDIO_FILES_BUCKET).createSignedUrl(version.storage_path,STUDIO_FILE_SIGNED_URL_SECONDS,{download:fileName});
 if(signedError||!signed?.signedUrl){console.error("CLIENT_FILE_DOWNLOAD_SIGNING_FAILED",{code:signedError?.name??"missing_url"});throw new ClientFileDownloadError(404);}
 const response=await fetch(signed.signedUrl,{cache:"no-store",redirect:"error"});
 if(!response.ok){console.error("CLIENT_FILE_DOWNLOAD_STREAM_FAILED",{status:response.status});throw new ClientFileDownloadError(response.status===404?404:503);}
 return{response,fileName};
}
