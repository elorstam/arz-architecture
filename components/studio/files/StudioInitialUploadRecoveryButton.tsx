"use client";
import {useState,useTransition} from "react";
import {recoverGoogleDriveFileUploadAction} from "@/app/studio/(protected)/projects/[projectId]/files/actions";
import {studioButtonClass,StudioButtonSpinner} from "@/components/studio/StudioButton";
export default function StudioInitialUploadRecoveryButton({projectId,fileId}:{projectId:string;fileId:string}){const[pending,start]=useTransition();const[message,setMessage]=useState("");return <div><button type="button" disabled={pending} className={studioButtonClass("primary","sm")} onClick={()=>start(async()=>{const result=await recoverGoogleDriveFileUploadAction(projectId,fileId);setMessage(result.message);})}>{pending?<><StudioButtonSpinner/>Doğrulanıyor…</>:"Yüklemeyi Doğrula ve Tamamla"}</button><p role="status" aria-live="polite" className="mt-2 text-sm">{message}</p></div>}
