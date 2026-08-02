"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {after} from "next/server";

import {StudioProjectError} from "@/lib/studio/projects/project-errors";
import {archiveStudioProject,createStudioProject,updateStudioProject,issuePermanentProjectDeletionConfirmation,permanentlyDeleteStudioProject} from "@/lib/studio/projects/project-repository";
import type {ProjectFormState} from "@/lib/studio/projects/project-types";
import {parseStudioProjectForm} from "@/lib/studio/projects/project-validation";
import {initializeStudioProjectDriveStorageIfReady} from "@/lib/studio/files/storage/project-drive-auto-initialization";
import {initializeOfficialProcesses} from "@/lib/studio/official-processes/official-process-repository";
import {initializeProjectStages} from "@/lib/studio/notifications/notification-repository";

function actionError(error:unknown,values:ProjectFormState["values"]):ProjectFormState{
 if(error instanceof StudioProjectError){
  if(error.code==="duplicate_code")return{success:false,message:error.message,values,fieldErrors:{code:[error.message]}};
  if(error.code==="invalid_responsible")return{success:false,message:error.message,values,fieldErrors:{responsibleUserId:[error.message]}};
  if(error.code==="forbidden"||error.code==="unauthorized")return{success:false,message:"Bu işlem için yetkiniz bulunmuyor.",values};
  if(error.code==="not_found")return{success:false,message:"Proje bulunamadı.",values};
 }
 console.error("Studio project action failed.",error);
 return{success:false,message:"Proje işlemi tamamlanamadı. Lütfen tekrar deneyin.",values};
}
export async function createStudioProjectAction(_previous:ProjectFormState,formData:FormData):Promise<ProjectFormState>{
 const parsed=parseStudioProjectForm(formData);
 if(!parsed.success)return{success:false,message:"Lütfen işaretli alanları kontrol edin.",values:parsed.values,fieldErrors:parsed.fieldErrors};
 let projectId:string;
 try{projectId=await createStudioProject(parsed.input);}
 catch(error){return actionError(error,parsed.values);}
 after(async()=>{await initializeStudioProjectDriveStorageIfReady(projectId).catch(()=>undefined);await initializeOfficialProcesses(projectId).catch(()=>undefined);await initializeProjectStages(projectId).catch(()=>undefined);});
 revalidatePath("/studio/projects");
 redirect(`/studio/projects/${projectId}`);
}
export async function updateStudioProjectAction(projectId:string,_previous:ProjectFormState,formData:FormData):Promise<ProjectFormState>{
 const parsed=parseStudioProjectForm(formData);
 if(!parsed.success)return{success:false,message:"Lütfen işaretli alanları kontrol edin.",values:parsed.values,fieldErrors:parsed.fieldErrors};
 try{await updateStudioProject(projectId,parsed.input);}
 catch(error){return actionError(error,parsed.values);}
 revalidatePath("/studio/projects");revalidatePath(`/studio/projects/${projectId}`);
 redirect(`/studio/projects/${projectId}`);
}
export async function setStudioProjectArchivedAction(projectId:string,archived:boolean){
 await archiveStudioProject(projectId,archived);
 revalidatePath("/studio/projects");revalidatePath(`/studio/projects/${projectId}`);
 redirect(archived?"/studio/projects?archive=archived":`/studio/projects/${projectId}`);
}

export async function preparePermanentProjectDeletionAction(projectId:string,expectedName:string){
 try{return {ok:true as const,token:await issuePermanentProjectDeletionConfirmation(projectId,expectedName)};}
 catch(error){return {ok:false as const,message:error instanceof StudioProjectError&&error.code==="forbidden"?"Bu işlem yalnızca proje sahibi tarafından yapılabilir.":"Proje silme onayı hazırlanamadı."};}
}

export async function permanentlyDeleteProjectAction(projectId:string,token:string,reason:string){
 try{
  await permanentlyDeleteStudioProject(projectId,token,reason);
  revalidatePath("/studio/projects");
 }catch(error){
  if(error instanceof StudioProjectError&&error.code==="forbidden")return{ok:false as const,message:"Bu işlem yalnızca proje sahibi tarafından yapılabilir."};
  return{ok:false as const,message:"Proje kalıcı olarak silinemedi. Onay süresi dolmuş olabilir."};
 }
 redirect("/studio/projects");
}
