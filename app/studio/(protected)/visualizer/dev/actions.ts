"use server";
import {revalidatePath} from "next/cache";
import {createRenderJob,requestJobState} from "@/lib/visualizer/server";
export async function createSmokeJob(formData:FormData){const prompt=String(formData.get("prompt")||"").trim();const projectId=String(formData.get("projectId")||"");if(!prompt||!projectId)throw new Error("Prompt ve proje gereklidir.");await createRenderJob({request:{projectId,quality:"draft",compute:"local",mode:"exterior",timeOfDay:"day",weather:"clear",prompt,negativePrompt:String(formData.get("negativePrompt")||""),settings:{workflowId:"smoke_txt2img_v1",width:512,height:512,seed:Number(formData.get("seed")||1)}},priority:50,maxAttempts:1});revalidatePath("/studio/visualizer/dev");}
export async function cancelSmokeJob(formData:FormData){const id=String(formData.get("jobId")||"");if(id)await requestJobState(id,"cancelled");revalidatePath("/studio/visualizer/dev");}
