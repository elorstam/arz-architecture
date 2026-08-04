"use client";
import {useState,useTransition} from "react";
import {updateRenderCategoryAction} from "@/app/studio/(protected)/projects/[projectId]/renders/actions";
import {studioButtonClass} from "@/components/studio/StudioButton";
import type {StudioRenderCategory} from "@/lib/studio/renders/render-types";

export default function StudioRenderCategoryManager({projectId,categories}:{projectId:string;categories:StudioRenderCategory[]}){
  const[open,setOpen]=useState(false),[pending,start]=useTransition(),[message,setMessage]=useState("");
  function save(category:StudioRenderCategory,form:HTMLFormElement,archive:boolean){const data=new FormData(form);data.set("archived",archive?"1":"0");start(async()=>setMessage((await updateRenderCategoryAction(projectId,category.id,data)).message));}
  return <section className="studio-render-category-manager"><button type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)} className={studioButtonClass("outline","sm")}>Render Kategorilerini Yönet</button>{open?<div className="studio-render-category-manager__grid">{categories.map(category=><form key={category.id} onSubmit={event=>{event.preventDefault();save(category,event.currentTarget,category.isArchived)}}><label className="min-w-0 flex-1 text-sm font-semibold">Kategori<input name="name" defaultValue={category.name} minLength={2} maxLength={80} className="studio-field mt-1 w-full"/></label><button type="button" disabled={pending} onClick={event=>{const form=event.currentTarget.form;if(form)save(category,form,!category.isArchived)}} className={studioButtonClass(category.isArchived?"outline":"ghost","sm")}>{category.isArchived?"Geri Al":"Arşivle"}</button><button disabled={pending} className={studioButtonClass("primary","sm")}>Adı Kaydet</button></form>)}</div>:null}{message?<p role="status" className="studio-render-message">{message}</p>:null}</section>;
}
