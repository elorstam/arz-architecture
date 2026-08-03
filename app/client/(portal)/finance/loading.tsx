import {StudioSkeleton} from "@/components/studio/ui/StudioUiPrimitives";
export default function ClientFinanceLoading(){return <div className="client-finance-loading" aria-label="Finans bilgileri yükleniyor"><StudioSkeleton className="h-24 w-full"/><div>{Array.from({length:4},(_,index)=><StudioSkeleton key={index} className="h-32 w-full"/>)}</div><StudioSkeleton className="h-96 w-full"/></div>;}
