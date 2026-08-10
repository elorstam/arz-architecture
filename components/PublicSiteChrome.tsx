"use client";

import {usePathname} from "next/navigation";

import Navbar from "@/components/Navbar";

export default function PublicSiteChrome({internalAppHost=false}:{internalAppHost?:boolean}){
  const pathname=usePathname();
  if(internalAppHost||pathname.startsWith("/admin")||pathname.startsWith("/studio")||pathname.startsWith("/client")||pathname.startsWith("/odeme/"))return null;
  return <Navbar/>;
}
