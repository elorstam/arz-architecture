import type {StudioIconName} from "@/components/studio/StudioIcons";
import {StudioIconSurface,type StudioIconTone} from "./StudioIconSurface";

export type StudioMilestoneVariant="architecture"|"structural"|"mechanical"|"electrical"|"ground"|"permit"|"delivery"|"modeling"|"material"|"lighting"|"first-render"|"revision"|"final-render";
const variantMap:Record<StudioMilestoneVariant,{icon:StudioIconName;tone:StudioIconTone}>={
  architecture:{icon:"briefcase",tone:"gold"},structural:{icon:"revision",tone:"purple"},mechanical:{icon:"activity",tone:"blue"},electrical:{icon:"sparkles",tone:"amber"},ground:{icon:"building",tone:"green"},permit:{icon:"file-text",tone:"sand"},delivery:{icon:"check",tone:"slate"},modeling:{icon:"briefcase",tone:"gold"},material:{icon:"image",tone:"purple"},lighting:{icon:"sparkles",tone:"blue"},"first-render":{icon:"render",tone:"amber"},revision:{icon:"revision",tone:"green"},"final-render":{icon:"render",tone:"sand"},
};

export function StudioMilestoneIcon({variant,size="md",status="upcoming",color,className=""}:{variant:StudioMilestoneVariant;size?:"sm"|"md"|"lg"|"xl";status?:"completed"|"current"|"upcoming"|"cancelled";color?:StudioIconTone;className?:string}){
  const selected=variantMap[variant];
  return <StudioIconSurface icon={selected.icon} tone={color??selected.tone} size={size} className={`studio-milestone-icon studio-milestone-icon--${status} ${className}`} />;
}
