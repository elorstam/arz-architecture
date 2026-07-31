"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import {StudioProjectError} from "@/lib/studio/projects/project-errors";
import {archiveStudioProject,createStudioProject,updateStudioProject} from "@/lib/studio/projects/project-repository";
import type {ProjectFormState} from "@/lib/studio/projects/project-types";
import {parseStudioProjectForm} from "@/lib/studio/projects/project-validation";

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
