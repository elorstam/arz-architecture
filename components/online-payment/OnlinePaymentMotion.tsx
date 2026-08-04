"use client";
import {useLayoutEffect,useRef} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export default function OnlinePaymentMotion(){
  const markerRef=useRef<HTMLSpanElement>(null);
  useLayoutEffect(()=>{const page=markerRef.current?.closest<HTMLElement>("[data-payment-page]");if(!page)return;const context=gsap.context(()=>{const heroItems=gsap.utils.toArray<HTMLElement>("section:first-of-type > *");const sections=gsap.utils.toArray<HTMLElement>("section:not(:first-of-type)");if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){gsap.set([...heroItems,...sections],{clearProps:"all"});return;}gsap.timeline({delay:.08,defaults:{ease:"power3.out"}}).fromTo(heroItems,{opacity:0,y:30},{opacity:1,y:0,duration:.8,stagger:.09});sections.forEach(section=>{const heading=section.querySelector<HTMLElement>("header, h2");const items=gsap.utils.toArray<HTMLElement>("article, li, aside, nav, dl, [data-payment-reveal]",section).filter(item=>!heading?.contains(item));const timeline=gsap.timeline({scrollTrigger:{trigger:section,start:"top 82%",once:true},defaults:{ease:"power3.out"}});if(heading)timeline.fromTo(heading,{opacity:0,y:28},{opacity:1,y:0,duration:.72});if(items.length)timeline.fromTo(items,{opacity:0,y:24},{opacity:1,y:0,duration:.68,stagger:.055},"-=.42");});requestAnimationFrame(()=>ScrollTrigger.refresh());},page);return()=>context.revert();},[]);
  return <span ref={markerRef} hidden aria-hidden="true"/>;
}
