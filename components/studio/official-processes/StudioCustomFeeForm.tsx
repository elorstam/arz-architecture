"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCustomFeeAction, type ProcessActionState } from "@/app/studio/(protected)/projects/[projectId]/official-processes/actions";
import { studioButtonClass } from "@/components/studio/StudioButton";

const initial: ProcessActionState = { success: false, message: "" };

export default function StudioCustomFeeForm({ projectId }: { projectId: string }) {
  const [state,action,pending]=useActionState(createCustomFeeAction.bind(null,projectId),initial);const formRef=useRef<HTMLFormElement>(null);
  useEffect(()=>{if(state.success)formRef.current?.reset();},[state.success]);
  return <form ref={formRef} action={action} className="grid min-w-0 gap-3 rounded-xl border border-[#dedad1] bg-[#faf8f3] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><label className="min-w-0 text-sm font-semibold">Özel Harç Ekle<input required maxLength={160} name="title" placeholder="Harç adı" className="mt-2 h-11 w-full min-w-0 rounded-lg border bg-white px-3 text-[15px]"/></label><button disabled={pending} className={studioButtonClass("primary")}>{pending?"Oluşturuluyor…":"Oluştur"}</button>{state.message?<p role={state.success?"status":"alert"} className="text-sm sm:col-span-2">{state.message}</p>:null}</form>;
}
