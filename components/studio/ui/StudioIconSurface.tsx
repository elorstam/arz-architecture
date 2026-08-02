import type {ReactNode} from "react";
import {StudioIcon,type StudioIconName} from "@/components/studio/StudioIcons";

export type StudioIconTone="gold"|"purple"|"blue"|"amber"|"green"|"sand"|"slate";

export function StudioIconSurface({icon,tone="blue",size="md",className="",children}:{icon?:StudioIconName;tone?:StudioIconTone;size?:"sm"|"md"|"lg";className?:string;children?:ReactNode}){
  return <span className={`studio-icon-surface studio-icon-surface--${tone} studio-icon-surface--${size} ${className}`}>{children??(icon?<StudioIcon name={icon} className="studio-icon-surface__icon"/>:null)}</span>;
}
