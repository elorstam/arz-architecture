"use client";
import { useId, useState } from "react";
import type { OfficialProcess } from "@/lib/studio/official-processes/official-process-types";

export default function StudioOfficialProcessTimeline({ events }: { events: OfficialProcess["events"] }) {
  const [expanded,setExpanded]=useState(false);const id=useId();const visible=expanded?events:events.slice(0,1);
  return <section className="border-t pt-4" aria-labelledby={`${id}-title`}><div className="flex items-center justify-between gap-3"><h3 id={`${id}-title`} className="text-sm font-semibold">Son İşlem</h3>{events.length>1?<button type="button" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(v=>!v)} className="text-sm font-semibold text-[#80662f] underline focus-visible:outline-2">{expanded?"Timeline’ı Kapat":"Timeline’ı Gör"}</button>:null}</div>{visible.length?<ol id={id} className="mt-3 space-y-2">{visible.map(event=><li key={event.id} className="border-l-2 border-[#c6aa73] pl-3"><p className="text-sm font-semibold">{event.title}</p><time className="text-xs text-[#747b78]">{new Intl.DateTimeFormat("tr-TR",{dateStyle:"long"}).format(new Date(event.createdAt))}</time></li>)}</ol>:<p className="mt-2 text-sm text-[#747b78]">Henüz olay yok.</p>}</section>;
}
