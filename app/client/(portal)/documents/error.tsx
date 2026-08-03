"use client";
import {StudioEmptyState} from "@/components/studio/StudioDesignSystem";
import {studioButtonClass} from "@/components/studio/StudioButton";
export default function ClientDocumentsError({unstable_retry}:{error:Error&{digest?:string};unstable_retry:()=>void}){return <div className="client-error-surface"><StudioEmptyState icon="warning" title="Evraklar şu anda yüklenemedi." description="Lütfen kısa bir süre sonra yeniden deneyin." action={<button className={studioButtonClass("primary","sm")} onClick={unstable_retry}>Yeniden Dene</button>}/></div>;}
