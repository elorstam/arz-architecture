"use client";
import {useState,useTransition} from "react";
import {repairFileVersionAction} from "@/app/studio/(protected)/projects/[projectId]/files/actions";
import {studioButtonClass,StudioButtonSpinner} from "@/components/studio/StudioButton";
export default function StudioVersionRepairButton({projectId,fileId,versionId}:{projectId:string;fileId:string;versionId:string}){const[pending,start]=useTransition();const[error,setError]=useState("");return <div><button type="button" disabled={pending} className={studioButtonClass("outline","sm")} onClick={()=>start(async()=>{setError("");try{await repairFileVersionAction(projectId,fileId,versionId);}catch(value){setError(value instanceof Error?value.message:"Sürüm onarılamadı.");}})}>{pending?<><StudioButtonSpinner/>Onarılıyor…</>:"Finalize’ı Tekrar Dene"}</button><p role="alert" className="mt-2 text-sm text-[#8b5141]">{error}</p></div>}
