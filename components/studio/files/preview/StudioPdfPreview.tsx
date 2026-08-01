"use client";
import {useMemo,useState} from "react";
import StudioPreviewSkeleton from "./StudioPreviewSkeleton";
import StudioPreviewToolbar from "./StudioPreviewToolbar";
import type {StudioPreviewFit} from "@/lib/studio/files/preview/preview-types";

export default function StudioPdfPreview({src,name}:{src:string;name:string}){const[page,setPage]=useState(1);const[zoom,setZoom]=useState(100);const[fit,setFit]=useState<StudioPreviewFit>("width");const[loading,setLoading]=useState(true);const[error,setError]=useState(false);const viewerUrl=useMemo(()=>`${src}#page=${page}&zoom=${fit==="width"?"page-width":fit==="screen"?"page-fit":zoom}`,[src,page,zoom,fit]);return <div className="overflow-hidden rounded-xl border border-[#ddd8ce] bg-[#e9e6df]">
 <StudioPreviewToolbar page={page} onPage={setPage} zoom={zoom} fit={fit} onZoomIn={()=>{setFit("actual");setZoom(value=>Math.min(250,value+25));}} onZoomOut={()=>{setFit("actual");setZoom(value=>Math.max(25,value-25));}} onFit={setFit} onActual={()=>{setFit("actual");setZoom(100);}}/>
 <div className="relative h-[62vh] min-h-[440px] sm:h-[70vh]" aria-busy={loading}>{loading&&!error?<div className="absolute inset-0 z-10"><StudioPreviewSkeleton/></div>:null}{error?<div role="alert" className="flex h-full items-center justify-center p-8 text-center"><div><h3 className="text-lg font-semibold">PDF önizlemesi yüklenemedi.</h3><p className="mt-2 text-sm text-[#69716f]">Dosyayı indirerek görüntülemeyi deneyin.</p></div></div>:<iframe key={viewerUrl} src={viewerUrl} title={`${name} PDF önizlemesi`} className="h-full w-full border-0" onLoad={()=>setLoading(false)} onError={()=>{setLoading(false);setError(true);}}/>}</div>
 </div>;}
