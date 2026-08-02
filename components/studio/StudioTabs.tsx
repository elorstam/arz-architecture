import Link from "next/link";
import {StudioIcon,type StudioIconName} from "@/components/studio/StudioIcons";

export type StudioTabItem={href:string;label:string;icon?:StudioIconName};
export type StudioTabsVariant="default"|"icon-navigation";

export default function StudioTabs({items,active,ariaLabel,variant="default"}:{items:readonly StudioTabItem[];active:string;ariaLabel:string;variant?:StudioTabsVariant}){
 const iconNavigation=variant==="icon-navigation";
 return <nav aria-label={ariaLabel} className={`studio-tabs min-w-0 ${iconNavigation?"studio-tabs--icon-navigation":""}`}><div className={`studio-tabs__track ${iconNavigation?"studio-tabs__track--icon-navigation":""}`}>{items.map(item=><Link key={item.href} href={item.href} aria-current={active===item.href?"page":undefined} className={`studio-tab ${iconNavigation?"studio-tab--icon-navigation":""} ${active===item.href?"studio-tab-active":"studio-tab-inactive"}`}>{item.icon?<StudioIcon name={item.icon} className="studio-tab__icon"/>:null}<span>{item.label}</span></Link>)}</div></nav>;
}
