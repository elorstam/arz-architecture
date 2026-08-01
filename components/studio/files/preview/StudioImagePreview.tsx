"use client";
/* eslint-disable @next/next/no-img-element -- Authenticated preview streams cannot be fetched safely by the public image optimizer. */
import {useState} from "react";
import StudioPreviewSkeleton from "./StudioPreviewSkeleton";
import StudioPreviewToolbar from "./StudioPreviewToolbar";
import type {StudioPreviewFit} from "@/lib/studio/files/preview/preview-types";

export default function StudioImagePreview({src,name}:{src:string;name:string}){const[zoom,setZoom]=useState(100);const[fit,setFit]=useState<StudioPreviewFit>("width");const[loading,setLoading]=useState(true);const[error,setError]=useState(false);const changeFit=(value:StudioPreviewFit)=>{setFit(value);setZoom(value==="actual"?100:value==="screen"?80:100);};return <div className="overflow-hidden rounded-xl border border-[#ddd8ce] bg-[#f3f0e9]">
 <StudioPreviewToolbar zoom={zoom} fit={fit} onZoomIn={()=>{setFit("actual");setZoom(value=>Math.min(300,value+25));}} onZoomOut={()=>{setFit("actual");setZoom(value=>Math.max(25,value-25));}} onFit={changeFit} onActual={()=>changeFit("actual")}/>
 <div className="relative flex min-h-[360px] max-h-[72vh] items-center justify-center overflow-auto p-4 sm:min-h-[480px] sm:p-6" aria-busy={loading}>{loading&&!error?<div className="absolute inset-0"><StudioPreviewSkeleton/></div>:null}{error?<div role="alert" className="p-8 text-center"><h3 className="text-lg font-semibold">Önizleme yüklenemedi.</h3><p className="mt-2 text-sm text-[#69716f]">Dosyayı indirerek görüntülemeyi deneyin.</p></div>:<img key={src} src={src} alt={`${name} dosya önizlemesi`} loading="lazy" onLoad={()=>setLoading(false)} onError={()=>{setLoading(false);setError(true);}} className={`block h-auto object-contain transition-[width,max-height] duration-200 ${fit==="screen"?"max-h-[62vh] max-w-full":fit==="width"?"w-full":"max-w-none"}`} style={fit==="actual"?{width:`${zoom}%`}:undefined}/>}</div>
 </div>;}
