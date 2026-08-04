"use client";

import Link from "next/link";
import {useEffect,useRef,useState,type FocusEvent,type KeyboardEvent} from "react";

type Props={label:string;contactHref:string;paymentHref:string;active:boolean;triggerClassName:string};

export default function ContactNavDropdown({label,contactHref,paymentHref,active,triggerClassName}:Props){
  const[open,setOpen]=useState(false);const rootRef=useRef<HTMLDivElement>(null);const triggerRef=useRef<HTMLButtonElement>(null);const firstItemRef=useRef<HTMLAnchorElement>(null);const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const cancelClose=()=>{if(closeTimer.current)clearTimeout(closeTimer.current);};
  const closeSoon=()=>{cancelClose();closeTimer.current=setTimeout(()=>setOpen(false),140);};
  const closeAndFocus=()=>{setOpen(false);triggerRef.current?.focus();};

  useEffect(()=>{const outside=(event:PointerEvent)=>{if(!rootRef.current?.contains(event.target as Node))setOpen(false);};document.addEventListener("pointerdown",outside);return()=>{document.removeEventListener("pointerdown",outside);cancelClose();};},[]);
  const onTriggerKeyDown=(event:KeyboardEvent<HTMLButtonElement>)=>{if(event.key==="ArrowDown"){event.preventDefault();setOpen(true);requestAnimationFrame(()=>firstItemRef.current?.focus());}if(event.key==="Escape"&&open){event.preventDefault();closeAndFocus();}};
  const onRootKeyDown=(event:KeyboardEvent<HTMLDivElement>)=>{if(event.key==="Escape"&&open){event.preventDefault();closeAndFocus();}};
  const onBlur=(event:FocusEvent<HTMLDivElement>)=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))closeSoon();};

  return <div ref={rootRef} className="contact-nav-dropdown relative" onMouseEnter={()=>{cancelClose();setOpen(true);}} onMouseLeave={closeSoon} onFocusCapture={()=>{cancelClose();setOpen(true);}} onBlur={onBlur} onKeyDown={onRootKeyDown}>
    <button ref={triggerRef} type="button" aria-haspopup="menu" aria-expanded={open} aria-controls="contact-navigation-menu" onClick={()=>setOpen(value=>!value)} onKeyDown={onTriggerKeyDown} className={`${triggerClassName} inline-flex items-center gap-1.5 focus-visible:text-white/90 focus-visible:outline-none`}>
      <span>{label}</span><span aria-hidden="true" className={`text-[8px] transition-transform duration-300 ${open?"rotate-180":""}`}>⌄</span>
      <span className={`absolute bottom-[2px] left-1/2 h-px -translate-x-1/2 bg-white/80 transition-[width,opacity] duration-500 ${active||open?"w-full opacity-80":"w-0 opacity-0 group-hover:w-full group-hover:opacity-70"}`}/>
    </button>
    <div className={`absolute left-1/2 top-full z-[90] w-[210px] -translate-x-1/2 pt-2 transition-[opacity,transform,visibility] duration-200 ${open?"visible translate-y-0 opacity-100":"pointer-events-none invisible -translate-y-1 opacity-0"}`}>
      <div id="contact-navigation-menu" role="menu" aria-label={label} className="contact-nav-dropdown__panel border p-1 shadow-[0_14px_38px_rgba(0,0,0,.18)]">
        <Link ref={firstItemRef} role="menuitem" href={contactHref} onClick={()=>setOpen(false)} className="contact-nav-dropdown__item flex min-h-11 items-center px-4 text-[11px] uppercase tracking-[.12em]">Teklif Al</Link>
        <Link role="menuitem" href={paymentHref} onClick={()=>setOpen(false)} className="contact-nav-dropdown__item flex min-h-11 items-center px-4 text-[11px] uppercase tracking-[.12em]">Online Ödeme</Link>
      </div>
    </div>
  </div>;
}
