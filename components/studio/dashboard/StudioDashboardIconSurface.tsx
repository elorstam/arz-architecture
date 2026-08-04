import {
  Activity,BriefcaseBusiness,Building2,CalendarDays,Check,Clock3,Factory,
  FileCheck2,FileText,Folder,House,Image,ReceiptText,Settings,Sparkles,
  Store,Users,WalletCards,Warehouse,TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import {StudioIconSurface,type StudioIconTone} from "@/components/studio/ui/StudioIconSurface";

export type DashboardIconName="activity"|"briefcase"|"building"|"calendar"|"check"|"clock"|"factory"|"file-check"|"file-text"|"folder"|"house"|"image"|"receipt"|"render"|"settings"|"sparkles"|"store"|"users"|"wallet"|"warehouse"|"warning";
export type DashboardIconTone="blue"|"purple"|"green"|"orange"|"red"|"yellow"|"slate";

const icons:Record<DashboardIconName,LucideIcon>={
  activity:Activity,briefcase:BriefcaseBusiness,building:Building2,calendar:CalendarDays,
  check:Check,clock:Clock3,factory:Factory,"file-check":FileCheck2,"file-text":FileText,
  folder:Folder,house:House,image:Image,receipt:ReceiptText,render:Image,settings:Settings,
  sparkles:Sparkles,store:Store,users:Users,wallet:WalletCards,warehouse:Warehouse,warning:TriangleAlert,
};
const tones:Record<DashboardIconTone,StudioIconTone>={blue:"blue",purple:"purple",green:"green",orange:"orange",red:"red",yellow:"orange",slate:"slate"};
const sizes={sm:"sm",md:"md",lg:"lg"} as const;

export default function StudioDashboardIconSurface({icon,tone="blue",size="md",className=""}:{icon:DashboardIconName;tone?:DashboardIconTone;size?:keyof typeof sizes;className?:string}){
  const Icon=icons[icon];
  return <StudioIconSurface tone={tones[tone]} size={sizes[size]} className={className}><Icon className="studio-icon-surface__icon block size-5 shrink-0" strokeWidth={2.2}/></StudioIconSurface>;
}
