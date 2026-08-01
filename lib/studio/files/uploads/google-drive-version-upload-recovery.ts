import "server-only";
import {getStudioContext} from "@/lib/studio/auth/get-studio-context";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import {StudioFileError} from "../file-errors";
import {getDriveFileMetadata,getGoogleAccessToken} from "../storage/google-drive-provider";
import {finalizeStudioFileVersion} from "../versions/version-repository";
import {physicalVersionName} from "../versions/version-naming";
import {normalizeRequiredText} from "../versions/version-text-normalization";
import {logVersionRecovery} from "./version-recovery-diagnostics";

type RawDriveFile={id:string;name:string|null;mimeType:string|null;size?:string;parents?:string[];trashed?:boolean;appProperties?:Record<string,string>};
const fields="id,name,mimeType,size,parents,trashed,appProperties";
const escapeQuery=(value:string)=>value.replace(/['\\]/g,char=>`\\${char}`);

async function matches(organizationId:string,parentId:string,versionId:string,fileId:string){
 const token=await getGoogleAccessToken(organizationId);
 const q=[`'${escapeQuery(parentId)}' in parents`,`trashed=false`,`appProperties has { key='version_id' and value='${escapeQuery(versionId)}' }`,`appProperties has { key='file_id' and value='${escapeQuery(fileId)}' }`].join(" and ");
 const response=await fetch(`https://www.googleapis.com/drive/v3/files?spaces=drive&pageSize=3&fields=${encodeURIComponent(`files(${fields})`)}&q=${encodeURIComponent(q)}`,{headers:{Authorization:`Bearer ${token}`},cache:"no-store"});
 if(!response.ok)throw new StudioFileError(response.status===401?"reauthorization_required":"storage","Google Drive sürüm doğrulaması tamamlanamadı.");
 return((await response.json()) as {files?:RawDriveFile[]}).files??[];
}

export async function recoverGoogleDriveVersionUpload(projectId:string,fileId:string,versionId:string){
 let step="reservation loaded";
 try{
  const context=await getStudioContext();
  if(!context?.user||!context.membership)throw new StudioFileError("unauthorized","Oturum gerekli.");
  if(context.membership.role!=="owner")throw new StudioFileError("forbidden","Bu işlem yalnızca Studio sahibi tarafından yapılabilir.");
  const organizationId=context.membership.organization_id;
  const supabase=await createStudioServerClient();
  const{data:version,error}=await supabase.from("studio_project_file_versions").select("id,file_id,project_id,organization_id,version_number,revision_code,revision_title,revision_note,status,is_current,original_file_name,mime_type,file_size,external_file_id,external_parent_folder_id").eq("id",versionId).eq("file_id",fileId).eq("project_id",projectId).eq("organization_id",organizationId).maybeSingle();
  if(error)throw error;
  if(!version)throw new StudioFileError("not_found","Sürüm rezervasyonu bulunamadı.");
  const{data:file,error:fileError}=await supabase.from("studio_project_files").select("id,display_name,current_version_id").eq("id",fileId).eq("project_id",projectId).eq("organization_id",organizationId).maybeSingle();
  if(fileError)throw fileError;
  if(!file)throw new StudioFileError("not_found","Logical dosya bulunamadı.");
  normalizeRequiredText(version.original_file_name,"original_file_name","version_upload_recovery");
  const expectedMime=normalizeRequiredText(version.mime_type,"mime_type","version_upload_recovery");
  const logicalName=normalizeRequiredText(file.display_name,"logical_file_name","version_upload_recovery");
  logVersionRecovery({versionId,step,success:true});
  if(version.status==="ready"&&file.current_version_id===versionId)return{completed:true as const};
  if(!version.external_parent_folder_id)throw new StudioFileError("storage","Sürüm hedef klasörü doğrulanamadı.");
  step="Drive search started";
  logVersionRecovery({versionId,step,success:true});
  let candidates:RawDriveFile[]=[];
  if(version.external_file_id){
   const known=await getDriveFileMetadata(organizationId,version.external_file_id);
   candidates=[{id:known.id,name:known.name,mimeType:known.mimeType??null,size:String(known.size??0),parents:known.parents,trashed:known.trashed,appProperties:known.appProperties}];
  }else candidates=await matches(organizationId,version.external_parent_folder_id,versionId,fileId);
  step="Drive object found";
  if(candidates.length!==1){
   await supabase.from("studio_project_file_versions").update({status:"action_required",sync_status:"action_required",sync_error_code:candidates.length?"version_upload_recovery_ambiguous":"version_upload_recovery_not_found"}).eq("id",versionId);
   throw new StudioFileError("partial_sync",candidates.length?"Birden fazla Drive sürümü eşleşti. Otomatik tamamlama durduruldu.":"Drive sürümü henüz doğrulanamadı. Aynı dosyayı yeniden yüklemeyin.");
  }
  logVersionRecovery({versionId,step,success:true});
  const candidate=candidates[0];
  const driveName=normalizeRequiredText(candidate.name,"drive_name","version_upload_recovery");
  const driveMime=normalizeRequiredText(candidate.mimeType,"drive_mime_type","version_upload_recovery");
  step="appProperties verified";
  if(candidate.trashed||candidate.appProperties?.version_id!==versionId||candidate.appProperties?.file_id!==fileId||candidate.appProperties?.organization_id!==organizationId||candidate.appProperties?.project_id!==projectId||driveName!==physicalVersionName(logicalName,version.version_number,version.revision_code))throw new StudioFileError("partial_sync","Drive sürüm kimliği rezervasyonla eşleşmedi.");
  logVersionRecovery({versionId,step,success:true});
  step="MIME verified";
  if(driveMime!==expectedMime)throw new StudioFileError("partial_sync","Drive sürümünün MIME bilgisi eşleşmedi.");
  logVersionRecovery({versionId,step,success:true});
  step="size verified";
  if(Number(candidate.size)!==Number(version.file_size))throw new StudioFileError("partial_sync","Drive sürümünün boyutu eşleşmedi.");
  logVersionRecovery({versionId,step,success:true});
  step="parent verified";
  if(!candidate.parents?.includes(version.external_parent_folder_id))throw new StudioFileError("partial_sync","Drive sürümünün klasörü eşleşmedi.");
  logVersionRecovery({versionId,step,success:true});
  if(version.status==="failed"){
   step="failed reservation reactivated";
   const{error:reactivateError}=await supabase.from("studio_project_file_versions").update({status:"action_required",sync_status:"action_required",sync_error_code:"version_upload_recovery_pending",external_file_id:candidate.id}).eq("id",versionId).eq("file_id",fileId);
   if(reactivateError)throw reactivateError;
   logVersionRecovery({versionId,step,success:true});
  }
  step="finalize RPC called";
  logVersionRecovery({versionId,step,success:true,rpc:"studio_finalize_file_version"});
  await finalizeStudioFileVersion(projectId,fileId,versionId,candidate.id);
  return{completed:true as const};
 }catch(error){
  logVersionRecovery({versionId,step,success:false,error,rpc:step.startsWith("finalize")?"studio_finalize_file_version":undefined});
  throw error;
 }
}
