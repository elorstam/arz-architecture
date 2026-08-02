import Link from "next/link";
export type StudioTabItem={href:string;label:string};
export default function StudioTabs({items,active,ariaLabel}:{items:readonly StudioTabItem[];active:string;ariaLabel:string}){return <nav aria-label={ariaLabel} className="studio-tabs min-w-0"><div className="studio-tabs__track">{items.map(item=><Link key={item.href} href={item.href} aria-current={active===item.href?"page":undefined} className={`studio-tab ${active===item.href?"studio-tab-active":"studio-tab-inactive"}`}>{item.label}</Link>)}</div></nav>}
