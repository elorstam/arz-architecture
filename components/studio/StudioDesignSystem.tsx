import type {ReactNode} from "react";
import type {StudioIconName} from "./StudioIcons";
import {StudioIconSurface,type StudioIconTone} from "./ui/StudioIconSurface";

export function StudioCard({children,className="",as:Tag="section"}:{children:ReactNode;className?:string;as?:"section"|"article"|"div"}){
  return <Tag className={`studio-card-v2 ${className}`}>{children}</Tag>;
}

export function StudioKpiCard({label,value,detail,icon="chart",tone="blue",className=""}:{label:string;value:ReactNode;detail?:string;icon?:StudioIconName;tone?:StudioIconTone;className?:string}){
  return <StudioCard as="article" className={`studio-kpi-v2 group ${className}`}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="studio-eyebrow">{label}</p><p className="studio-kpi-value">{value}</p></div><StudioIconSurface icon={icon} tone={tone} size="lg" className="studio-kpi-icon"/></div>{detail?<p className="studio-kpi-detail">{detail}</p>:null}</StudioCard>;
}

export function StudioToolbar({children,className=""}:{children:ReactNode;className?:string}){
  return <div className={`studio-toolbar-v2 ${className}`}>{children}</div>;
}

export function StudioEmptyState({icon="folder",title,description,action}:{icon?:StudioIconName;title:string;description?:string;action?:ReactNode}){
  return <div className="studio-empty-v2"><StudioIconSurface icon={icon} tone="slate" size="lg" className="studio-empty-icon"/><h3>{title}</h3>{description?<p>{description}</p>:null}{action?<div className="mt-5">{action}</div>:null}</div>;
}
