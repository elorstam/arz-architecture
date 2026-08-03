"use client";

import Link from "next/link";
import {useEffect,useRef} from "react";
import {StudioIcon,type StudioIconName} from "@/components/studio/StudioIcons";

export type StudioTabItem={href?:string;label:string;icon?:StudioIconName;badge?:string;disabled?:boolean};
export type StudioTabsVariant="default"|"icon-navigation"|"workspace-navigation";

export default function StudioTabs({items,active,ariaLabel,variant="default"}:{items:readonly StudioTabItem[];active:string;ariaLabel:string;variant?:StudioTabsVariant}){
 const activeItemRef=useRef<HTMLAnchorElement>(null);
 const viewportRef=useRef<HTMLDivElement>(null);
 const iconNavigation=variant==="icon-navigation";
 const workspaceNavigation=variant==="workspace-navigation";
 const variantClass=iconNavigation?"icon-navigation":workspaceNavigation?"workspace-navigation":"";
 const content=(item:StudioTabItem)=><>{item.icon?<span className="studio-tab__icon-surface"><StudioIcon name={item.icon} className="studio-tab__icon"/></span>:null}<span>{item.label}</span>{item.badge?<span className="studio-tab__badge">{item.badge}</span>:null}</>;
 useEffect(()=>{const activeItem=activeItemRef.current,viewport=viewportRef.current;if(!workspaceNavigation||!activeItem||!viewport)return;const itemRect=activeItem.getBoundingClientRect(),viewportRect=viewport.getBoundingClientRect();if(itemRect.left<viewportRect.left)viewport.scrollBy({left:itemRect.left-viewportRect.left-12,behavior:"smooth"});else if(itemRect.right>viewportRect.right)viewport.scrollBy({left:itemRect.right-viewportRect.right+12,behavior:"smooth"})},[active,workspaceNavigation]);
 const itemStyle=workspaceNavigation?{flex:"0 0 auto",paddingInline:"1rem"}:undefined;
 const tabs=items.map(item=>item.disabled||!item.href?<span key={item.label} aria-disabled="true" title={`${item.label} yakında kullanıma açılacak`} style={itemStyle} className={`studio-tab ${variantClass?`studio-tab--${variantClass}`:""} ${workspaceNavigation?"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap":""} studio-tab-inactive studio-tab-disabled`}>{content(item)}</span>:<Link ref={active===item.href?activeItemRef:undefined} key={item.href} href={item.href} transitionTypes={workspaceNavigation?["studio-workspace"]:undefined} aria-current={active===item.href?"page":undefined} style={itemStyle} className={`studio-tab ${variantClass?`studio-tab--${variantClass}`:""} ${workspaceNavigation?"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap":""} ${active===item.href?"studio-tab-active":"studio-tab-inactive"}`}>{content(item)}</Link>);
 if(workspaceNavigation)return <nav aria-label={ariaLabel} className="studio-tabs studio-tabs--workspace-navigation relative w-full min-w-0"><div ref={viewportRef} className="w-full min-w-0 overflow-x-auto overflow-y-hidden scroll-smooth px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><div style={{gap:"0.375rem"}} className="studio-tabs__track studio-tabs__track--workspace-navigation flex w-max min-w-full flex-nowrap items-center before:w-1 before:shrink-0 after:w-1 after:shrink-0">{tabs}</div></div></nav>;
 return <nav aria-label={ariaLabel} className={`studio-tabs min-w-0 ${variantClass?`studio-tabs--${variantClass}`:""}`}><div className={`studio-tabs__track ${variantClass?`studio-tabs__track--${variantClass}`:""}`}>{tabs}</div></nav>;
}
