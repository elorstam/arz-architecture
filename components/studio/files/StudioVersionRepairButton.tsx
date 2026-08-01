"use client";
import {useState,useTransition} from "react";
import {recoverFileVersionUploadAction} from "@/app/studio/(protected)/projects/[projectId]/files/actions";
import {studioButtonClass,StudioButtonSpinner} from "@/components/studio/StudioButton";
export default function StudioVersionRepairButton({projectId,fileId,versionId}:{projectId:string;fileId:string;versionId:string}){const[pending,start]=useTransition();const[error,setError]=useState("");return <div><button type="button" disabled={pending} className={studioButtonClass("outline","sm")} onClick={()=>start(async()=>{setError("");const result=await recoverFileVersionUploadAction(projectId,fileId,versionId);if(!result.ok)setError(result.message);})}>{pending?<><StudioButtonSpinner/>Onarılıyor…</>:"Yüklemeyi Doğrula ve Tamamla"}</button><p role="alert" className="mt-2 text-sm text-[#8b5141]">{error}</p></div>}
