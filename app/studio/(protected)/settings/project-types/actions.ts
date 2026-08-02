"use server";
import {revalidatePath} from "next/cache";
import {createStudioProjectType,setStudioProjectTypeActive} from "@/lib/studio/projects/project-repository";
export async function setStudioProjectTypeActiveAction(id:string,active:boolean){await setStudioProjectTypeActive(id,active);revalidatePath("/studio/settings/project-types");}
export async function createStudioProjectTypeAction(formData:FormData){await createStudioProjectType(String(formData.get("canonicalKey")??""),String(formData.get("displayName")??""));revalidatePath("/studio/settings/project-types");}
