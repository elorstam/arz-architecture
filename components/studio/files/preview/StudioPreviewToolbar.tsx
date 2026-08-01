"use client";
import {studioButtonClass} from "@/components/studio/StudioButton";
import type {StudioPreviewFit} from "@/lib/studio/files/preview/preview-types";

export default function StudioPreviewToolbar({zoom,fit,onZoomIn,onZoomOut,onFit,onActual,page,onPage}:{zoom:number;fit:StudioPreviewFit;onZoomIn:()=>void;onZoomOut:()=>void;onFit:(fit:StudioPreviewFit)=>void;onActual:()=>void;page?:number;onPage?:(page:number)=>void}){
 return <div className="flex flex-wrap items-center gap-2 border-b border-[#ddd8ce] bg-white p-3" role="toolbar" aria-label="Önizleme araçları">
  {page&&onPage?<><button type="button" onClick={()=>onPage(Math.max(1,page-1))} disabled={page<=1} className={studioButtonClass("ghost","sm")} aria-label="Önceki PDF sayfası">←</button><label className="flex items-center gap-2 text-sm font-semibold text-[#596260]">Sayfa<input type="number" min={1} value={page} onChange={event=>onPage(Math.max(1,Number(event.target.value)||1))} className="h-9 w-16 rounded-lg border px-2 text-sm" aria-label="PDF sayfa numarası"/></label><button type="button" onClick={()=>onPage(page+1)} className={studioButtonClass("ghost","sm")} aria-label="Sonraki PDF sayfası">→</button><span className="mx-1 h-6 w-px bg-[#ddd8ce]" aria-hidden="true"/></>:null}
  <button type="button" onClick={onZoomOut} className={studioButtonClass("ghost","sm")} aria-label="Uzaklaştır">−</button><span className="min-w-12 text-center text-sm font-semibold" aria-live="polite">%{zoom}</span><button type="button" onClick={onZoomIn} className={studioButtonClass("ghost","sm")} aria-label="Yakınlaştır">+</button>
  <button type="button" onClick={()=>onFit("width")} aria-pressed={fit==="width"} className={studioButtonClass(fit==="width"?"secondary":"ghost","sm")}>Genişliğe Sığdır</button>
  <button type="button" onClick={()=>onFit("screen")} aria-pressed={fit==="screen"} className={studioButtonClass(fit==="screen"?"secondary":"ghost","sm")}>Ekrana Sığdır</button>
  <button type="button" onClick={onActual} aria-pressed={fit==="actual"} className={studioButtonClass(fit==="actual"?"secondary":"ghost","sm")}>%100</button>
 </div>;
}
