"use client";

import Link from "next/link";
import {forwardRef,type ComponentProps,type ReactNode} from "react";

type Props=Omit<ComponentProps<typeof Link>,"children"|"className">&{active:boolean;children:ReactNode;endAdornment?:ReactNode};

const NavbarPrimaryItem=forwardRef<HTMLAnchorElement,Props>(function NavbarPrimaryItem({active,children,endAdornment,...props},ref){
  return <Link ref={ref} {...props} className={`group relative inline-flex items-center py-3 text-[12px] font-normal uppercase leading-normal tracking-[0.11em] transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:text-white/90 focus-visible:outline-none 2xl:text-[14px] 2xl:tracking-[0.13em] ${active?"text-white/90":"text-white/62 hover:-translate-y-px hover:text-white/90"}`}>
    <span className="block whitespace-nowrap">{children}</span>{endAdornment}
    <span className={`absolute bottom-[2px] left-1/2 h-px -translate-x-1/2 bg-white/80 transition-[width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${active?"w-full opacity-80":"w-0 opacity-0 group-hover:w-full group-hover:opacity-70 group-focus-visible:w-full group-focus-visible:opacity-70"}`}/>
  </Link>;
});
export default NavbarPrimaryItem;
