import {
  Activity,BriefcaseBusiness,Building2,CalendarDays,Check,Clock3,Factory,
  FileCheck2,FileText,Folder,House,Image,ReceiptText,Settings,Sparkles,
  Store,Users,WalletCards,Warehouse,TriangleAlert,
  type LucideIcon,
} from "lucide-react";

export type DashboardIconName="activity"|"briefcase"|"building"|"calendar"|"check"|"clock"|"factory"|"file-check"|"file-text"|"folder"|"house"|"image"|"receipt"|"render"|"settings"|"sparkles"|"store"|"users"|"wallet"|"warehouse"|"warning";
export type DashboardIconTone="blue"|"purple"|"green"|"orange"|"red"|"yellow"|"slate";

const icons:Record<DashboardIconName,LucideIcon>={
  activity:Activity,briefcase:BriefcaseBusiness,building:Building2,calendar:CalendarDays,
  check:Check,clock:Clock3,factory:Factory,"file-check":FileCheck2,"file-text":FileText,
  folder:Folder,house:House,image:Image,receipt:ReceiptText,render:Image,settings:Settings,
  sparkles:Sparkles,store:Store,users:Users,wallet:WalletCards,warehouse:Warehouse,warning:TriangleAlert,
};
const tones:Record<DashboardIconTone,string>={
  blue:"from-[#e4f2ff] to-[#f1f7ff] text-[#2475cf] shadow-[0_7px_16px_rgba(36,117,207,.14)]",
  purple:"from-[#eee8ff] to-[#f8f5ff] text-[#7550d8] shadow-[0_7px_16px_rgba(117,80,216,.14)]",
  green:"from-[#e4f7eb] to-[#f2fbf5] text-[#278b52] shadow-[0_7px_16px_rgba(39,139,82,.13)]",
  orange:"from-[#ffeddc] to-[#fff7ed] text-[#d36a18] shadow-[0_7px_16px_rgba(211,106,24,.14)]",
  red:"from-[#ffe8e7] to-[#fff5f4] text-[#c74e49] shadow-[0_7px_16px_rgba(199,78,73,.13)]",
  yellow:"from-[#fff3ce] to-[#fffaf0] text-[#b98212] shadow-[0_7px_16px_rgba(185,130,18,.13)]",
  slate:"from-[#e9eef3] to-[#f7f9fb] text-[#536b7b] shadow-[0_7px_16px_rgba(83,107,123,.12)]",
};
const sizes={sm:"h-10 w-10 rounded-[14px] [&>svg]:h-5 [&>svg]:w-5",md:"h-11 w-11 rounded-2xl [&>svg]:h-[22px] [&>svg]:w-[22px]",lg:"h-[52px] w-[52px] rounded-[18px] [&>svg]:h-6 [&>svg]:w-6"};

export default function StudioDashboardIconSurface({icon,tone="blue",size="md",className=""}:{icon:DashboardIconName;tone?:DashboardIconTone;size?:keyof typeof sizes;className?:string}){
  const Icon=icons[icon];
  return <span aria-hidden="true" className={`inline-grid shrink-0 place-items-center bg-gradient-to-br ${tones[tone]} ${sizes[size]} ${className}`}><Icon strokeWidth={2}/></span>;
}
