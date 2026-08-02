import {StudioIconSurface,type StudioIconTone} from "./StudioIconSurface";
import type {StudioIconName} from "@/components/studio/StudioIcons";

export type StudioActivityVariant="file"|"folder"|"upload"|"render"|"revision"|"finance"|"notification"|"user"|"project"|"warning"|"success";
const activityMap:Record<StudioActivityVariant,{icon:StudioIconName;tone:StudioIconTone}>={file:{icon:"file-text",tone:"blue"},folder:{icon:"folder",tone:"gold"},upload:{icon:"upload",tone:"purple"},render:{icon:"render",tone:"amber"},revision:{icon:"revision",tone:"green"},finance:{icon:"wallet",tone:"slate"},notification:{icon:"notifications",tone:"blue"},user:{icon:"user",tone:"purple"},project:{icon:"briefcase",tone:"gold"},warning:{icon:"warning",tone:"red"},success:{icon:"check",tone:"green"}};
export function StudioActivityIcon({variant,size="md",className=""}:{variant:StudioActivityVariant;size?:"sm"|"md"|"lg"|"xl";className?:string}){const selected=activityMap[variant];return <StudioIconSurface icon={selected.icon} tone={selected.tone} size={size} className={className}/>;}
