import {StudioSkeleton} from "@/components/studio/ui";

export default function ProjectsLoading(){
 return <section aria-label="Projeler yükleniyor" className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8">
  <StudioSkeleton className="block h-8 w-48 rounded-lg"/>
  <StudioSkeleton className="mt-3 block h-4 w-80 max-w-full rounded"/>
  <StudioSkeleton className="mt-6 block h-16 rounded-2xl"/>
  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0,1,2].map(value=><StudioSkeleton key={value} className="block h-[350px] rounded-[18px]"/>)}</div>
 </section>;
}
