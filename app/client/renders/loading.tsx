import {StudioSkeleton} from "@/components/studio/ui/StudioUiPrimitives";
export default function ClientRendersLoading(){return <div className="client-renders-loading" aria-label="Renderlar yükleniyor"><StudioSkeleton className="h-24 w-full"/><div>{Array.from({length:8},(_,index)=><StudioSkeleton key={index} className="h-64 w-full"/>)}</div></div>;}
