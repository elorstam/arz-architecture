import type {HTMLAttributes,ReactNode} from "react";
import {StudioIcon,type StudioIconName} from "@/components/studio/StudioIcons";

export type StudioIconTone="blue"|"green"|"purple"|"orange"|"slate"|"red";

export function StudioIconSurface({icon,tone="blue",size="md",shape="squircle",interactive=false,className="",children,...props}:{icon?:StudioIconName;tone?:StudioIconTone;size?:"sm"|"md"|"lg"|"xl"|"kpi";shape?:"rounded"|"squircle";interactive?:boolean;className?:string;children?:ReactNode}&Omit<HTMLAttributes<HTMLSpanElement>,"aria-hidden">&{"aria-hidden"?:boolean}){
  const kpi=size==="kpi";
  if(kpi)return <span {...props} className={`studio-icon-surface studio-icon-surface--${tone} studio-icon-surface--kpi inline-grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl leading-none ${className}`}><span aria-hidden="true" className="studio-icon-surface__content grid size-6 shrink-0 place-items-center leading-none">{children??(icon?<StudioIcon name={icon} className="studio-icon-surface__icon block size-5 shrink-0" strokeWidth={2.2}/>:null)}</span></span>;
  return <span {...props} aria-hidden={props["aria-hidden"]??(icon?true:undefined)} className={`studio-icon-surface studio-icon-surface--${tone} studio-icon-surface--${size} studio-icon-surface--${shape} ${interactive?"studio-icon-surface--interactive":""} ${className}`}><span className="studio-icon-surface__content">{children??(icon?<StudioIcon name={icon} className="studio-icon-surface__icon"/>:null)}</span></span>;
}
