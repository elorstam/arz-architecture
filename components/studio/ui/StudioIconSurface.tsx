import type {HTMLAttributes,ReactNode} from "react";
import {StudioIcon,type StudioIconName} from "@/components/studio/StudioIcons";

export type StudioIconTone="gold"|"purple"|"blue"|"amber"|"green"|"sand"|"slate"|"red";

export function StudioIconSurface({icon,tone="blue",size="md",shape="squircle",interactive=false,className="",children,...props}:{icon?:StudioIconName;tone?:StudioIconTone;size?:"sm"|"md"|"lg"|"xl";shape?:"rounded"|"squircle";interactive?:boolean;className?:string;children?:ReactNode}&Omit<HTMLAttributes<HTMLSpanElement>,"aria-hidden">&{"aria-hidden"?:boolean}){
  return <span {...props} aria-hidden={props["aria-hidden"]??(icon?true:undefined)} className={`studio-icon-surface studio-icon-surface--${tone} studio-icon-surface--${size} studio-icon-surface--${shape} ${interactive?"studio-icon-surface--interactive":""} ${className}`}>{children??(icon?<StudioIcon name={icon} className="studio-icon-surface__icon"/>:null)}</span>;
}
