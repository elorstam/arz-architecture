"use client";

import Link from "next/link";
import {useActionState} from "react";

import {PROJECT_STAGES,PROJECT_STATUSES} from "@/lib/studio/projects/project-constants";
import type {ProjectFormState,ProjectFormValues,StudioProjectMember} from "@/lib/studio/projects/project-types";
import {StudioPendingLabel,studioButtonClass} from "@/components/studio/StudioButton";

type Action=(state:ProjectFormState,formData:FormData)=>Promise<ProjectFormState>;
const emptyValues:ProjectFormValues={name:"",code:"",category:"",location:"",projectYear:String(new Date().getFullYear()),
 clientName:"",clientContactName:"",clientEmail:"",clientPhone:"",stage:"",status:"Aktif",progress:"0",
 startDate:"",targetDate:"",summary:"",currentPhase:"",nextMilestone:"",nextMilestoneDate:"",responsibleUserId:""};

function Field({name,label,state,type="text",required,placeholder}:{
 name:keyof ProjectFormValues;label:string;state:ProjectFormState;type?:string;required?:boolean;placeholder?:string;
}){
 const error=state.fieldErrors?.[name]?.[0];
 return <label className="block min-w-0"><span className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#777a75]">{label}{required?" *":""}</span>
  <input name={name} type={type} required={required} placeholder={placeholder} defaultValue={state.values?.[name]??emptyValues[name]}
   min={type==="number"?0:undefined} max={type==="number"?100:undefined} aria-invalid={Boolean(error)} aria-describedby={error?`${name}-error`:undefined}
   className="mt-2 h-11 w-full rounded-lg border border-[#ddd8ce] bg-[#fbfaf7] px-3 text-[11px] text-[#343b40] outline-none placeholder:text-[#aaa9a4] focus:border-[#a58a56] focus:ring-2 focus:ring-[#a58a56]/15 aria-[invalid=true]:border-[#a56650]" />
  {error?<span id={`${name}-error`} className="mt-1.5 block text-[9px] text-[#9b5d48]">{error}</span>:null}</label>;
}
function TextArea({name,label,state,placeholder}:{
 name:keyof ProjectFormValues;label:string;state:ProjectFormState;placeholder?:string;
}){
  const error=state.fieldErrors?.[name]?.[0];
 return <label className="block"><span className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#777a75]">{label}</span>
  <textarea name={name} rows={4} placeholder={placeholder} defaultValue={state.values?.[name]??emptyValues[name]} aria-invalid={Boolean(error)} aria-describedby={error?`${name}-error`:undefined}
   className="mt-2 w-full resize-y rounded-lg border border-[#ddd8ce] bg-[#fbfaf7] px-3 py-3 text-[11px] leading-5 text-[#343b40] outline-none placeholder:text-[#aaa9a4] focus:border-[#a58a56] focus:ring-2 focus:ring-[#a58a56]/15" />
  {error?<span id={`${name}-error`} className="mt-1.5 block text-[9px] text-[#9b5d48]">{error}</span>:null}</label>;
}
export default function StudioProjectForm({action,initialValues,members,mode,projectId,projectTypes}:{
 action:Action;initialValues?:ProjectFormValues;members:StudioProjectMember[];mode:"create"|"edit";projectId?:string;projectTypes?:{display_name:string;is_active:boolean}[];
}){
 void projectTypes;
 const[state,formAction,pending]=useActionState(action,{success:false,values:initialValues??emptyValues});
 const values=state.values??initialValues??emptyValues;
 return <form action={formAction} className="space-y-5">
  {state.message?<div role="alert" className="rounded-lg border border-[#decfc7] bg-[#f8f1ee] px-4 py-3 text-[10px] text-[#875b4b]">{state.message}</div>:null}
  <section className="rounded-xl border border-[#dedad1] bg-white p-5 shadow-[0_4px_18px_rgba(32,39,46,.03)] sm:p-6">
   <div className="border-b border-[#ece9e3] pb-4"><h2 className="text-[14px] font-semibold text-[#2d353b]">Temel Bilgiler</h2><p className="mt-1 text-[9px] text-[#989994]">Projeyi Studio içinde tanımlayan ana bilgiler</p></div>
   <div className="mt-5 grid gap-5 sm:grid-cols-2"><Field name="name" label="Proje Adı" state={state} required/><Field name="code" label="Proje Kodu" state={state} required placeholder="Örn. VP-26"/><Field name="category" label="Kategori" state={state}/><Field name="location" label="Konum" state={state}/><Field name="projectYear" label="Proje Yılı" state={state}/></div>
  </section>
  <section className="rounded-xl border border-[#dedad1] bg-white p-5 shadow-[0_4px_18px_rgba(32,39,46,.03)] sm:p-6">
   <div className="border-b border-[#ece9e3] pb-4"><h2 className="text-[14px] font-semibold text-[#2d353b]">Müşteri</h2></div>
   <div className="mt-5 grid gap-5 sm:grid-cols-2"><Field name="clientName" label="Müşteri / Şirket" state={state}/><Field name="clientContactName" label="İletişim Kişisi" state={state}/><Field name="clientEmail" label="E-posta" state={state} type="email"/><Field name="clientPhone" label="Telefon" state={state}/></div>
  </section>
  <section className="rounded-xl border border-[#dedad1] bg-white p-5 shadow-[0_4px_18px_rgba(32,39,46,.03)] sm:p-6">
   <div className="border-b border-[#ece9e3] pb-4"><h2 className="text-[14px] font-semibold text-[#2d353b]">Süreç ve Takvim</h2></div>
   <div className="mt-5 grid gap-5 sm:grid-cols-2">
    <label><span className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#777a75]">Aşama</span><select name="stage" defaultValue={values.stage} className="mt-2 h-11 w-full rounded-lg border border-[#ddd8ce] bg-[#fbfaf7] px-3 text-[11px] outline-none focus:border-[#a58a56]">{PROJECT_STAGES.map(v=><option key={v}>{v}</option>)}</select>{state.fieldErrors?.stage?.[0]?<span className="mt-1 block text-[9px] text-[#9b5d48]">{state.fieldErrors.stage[0]}</span>:null}</label>
    <label><span className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#777a75]">Durum</span><select name="status" defaultValue={values.status==="Arşivlendi"?"Aktif":values.status} className="mt-2 h-11 w-full rounded-lg border border-[#ddd8ce] bg-[#fbfaf7] px-3 text-[11px] outline-none focus:border-[#a58a56]">{PROJECT_STATUSES.filter(v=>v!=="Arşivlendi").map(v=><option key={v}>{v}</option>)}</select></label>
    <Field name="progress" label="İlerleme (%)" state={state} type="number"/><Field name="startDate" label="Başlangıç Tarihi" state={state} type="date"/><Field name="targetDate" label="Hedef Teslim Tarihi" state={state} type="date"/>
    <label><span className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#777a75]">Sorumlu Kullanıcı</span><select name="responsibleUserId" defaultValue={values.responsibleUserId} className="mt-2 h-11 w-full rounded-lg border border-[#ddd8ce] bg-[#fbfaf7] px-3 text-[11px] outline-none focus:border-[#a58a56]"><option value="">Atanmadı</option>{members.map(m=><option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}</select>{state.fieldErrors?.responsibleUserId?.[0]?<span className="mt-1 block text-[9px] text-[#9b5d48]">{state.fieldErrors.responsibleUserId[0]}</span>:null}</label>
   </div>
  </section>
  <section className="rounded-xl border border-[#dedad1] bg-white p-5 shadow-[0_4px_18px_rgba(32,39,46,.03)] sm:p-6">
   <div className="border-b border-[#ece9e3] pb-4"><h2 className="text-[14px] font-semibold text-[#2d353b]">Açıklama</h2></div>
   <div className="mt-5 grid gap-5 lg:grid-cols-2"><TextArea name="summary" label="Proje Özeti" state={state}/><TextArea name="currentPhase" label="Mevcut Faz Açıklaması" state={state}/><Field name="nextMilestone" label="Sonraki Kilometre Taşı" state={state}/><Field name="nextMilestoneDate" label="Kilometre Taşı Tarihi" state={state} type="date"/></div>
  </section>
  <div className="flex flex-col-reverse gap-3 border-t border-[#dcd7cd] pt-5 sm:flex-row sm:justify-end">
   <Link href={projectId?`/studio/projects/${projectId}`:"/studio/projects"} className={studioButtonClass("outline")}>Vazgeç</Link>
   <button type="submit" disabled={pending} aria-busy={pending} className={studioButtonClass("primary")}><StudioPendingLabel pending={pending} pendingLabel={mode==="create"?"Proje Oluşturuluyor...":"Değişiklikler Kaydediliyor..."}>{mode==="create"?"Proje Oluştur":"Değişiklikleri Kaydet"}</StudioPendingLabel></button>
  </div>
 </form>;
}
