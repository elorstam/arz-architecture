"use client";

import Link from "next/link";
import {useEffect,useRef,useState,type FocusEvent,type KeyboardEvent} from "react";
import NavbarPrimaryItem from "@/components/NavbarPrimaryItem";

type Props={label:string;contactHref:string;paymentHref:string;active:boolean};

export default function ContactNavDropdown({label,contactHref,paymentHref,active}:Props){
  const[open,setOpen]=useState(false);const rootRef=useRef<HTMLDivElement>(null);const triggerRef=useRef<HTMLAnchorElement>(null);const firstItemRef=useRef<HTMLAnchorElement>(null);const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const cancelClose=()=>{if(closeTimer.current)clearTimeout(closeTimer.current);};
  const closeSoon=()=>{cancelClose();closeTimer.current=setTimeout(()=>setOpen(false),140);};
  const closeAndFocus=()=>{setOpen(false);triggerRef.current?.focus();};

  useEffect(()=>{const outside=(event:PointerEvent)=>{if(!rootRef.current?.contains(event.target as Node))setOpen(false);};document.addEventListener("pointerdown",outside);return()=>{document.removeEventListener("pointerdown",outside);cancelClose();};},[]);
  const onTriggerKeyDown=(event:KeyboardEvent<HTMLAnchorElement>)=>{if(event.key==="ArrowDown"){event.preventDefault();setOpen(true);requestAnimationFrame(()=>firstItemRef.current?.focus());}if(event.key===" "){event.preventDefault();setOpen(value=>!value);}if(event.key==="Escape"&&open){event.preventDefault();closeAndFocus();}};
  const onRootKeyDown=(event:KeyboardEvent<HTMLDivElement>)=>{if(event.key==="Escape"&&open){event.preventDefault();closeAndFocus();}};
  const onBlur=(event:FocusEvent<HTMLDivElement>)=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))closeSoon();};

  return <div ref={rootRef} className="contact-nav-dropdown relative" onMouseEnter={()=>{cancelClose();setOpen(true);}} onMouseLeave={closeSoon} onFocusCapture={()=>{cancelClose();setOpen(true);}} onBlur={onBlur} onKeyDown={onRootKeyDown}>
    <NavbarPrimaryItem ref={triggerRef} href={contactHref} active={active} aria-haspopup="menu" aria-expanded={open} aria-controls="contact-navigation-menu" onClick={event=>{event.preventDefault();setOpen(value=>!value);}} onKeyDown={onTriggerKeyDown} endAdornment={<span aria-hidden="true" className={`ml-1 text-[12px] leading-none opacity-70 transition-[color,transform] duration-300 ${open?"rotate-180":""}`}>⌄</span>}>{label}</NavbarPrimaryItem>
    <div className={`absolute left-1/2 top-full z-[90] w-[210px] -translate-x-1/2 pt-2 transition-[opacity,transform,visibility] duration-200 ${open?"visible translate-y-0 opacity-100":"pointer-events-none invisible -translate-y-1 opacity-0"}`}>
      <div id="contact-navigation-menu" role="menu" aria-label={label} className="contact-nav-dropdown__panel border p-1 shadow-[0_14px_38px_rgba(0,0,0,.18)]">
        <Link ref={firstItemRef} role="menuitem" href={contactHref} onClick={()=>setOpen(false)} className="contact-nav-dropdown__item flex min-h-11 items-center px-4 text-[11px] uppercase tracking-[.12em]">Teklif Al</Link>
        <Link role="menuitem" href={paymentHref} onClick={()=>setOpen(false)} className="contact-nav-dropdown__item flex min-h-11 items-center px-4 text-[11px] uppercase tracking-[.12em]">Online Ödeme</Link>
      </div>
    </div>
  </div>;
}
