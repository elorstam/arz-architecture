export default function ProjectsLoading(){
 return <section aria-label="Projeler yükleniyor" className="mx-auto max-w-[1540px] animate-pulse px-4 py-8 sm:px-6 lg:px-8"><div className="h-7 w-48 rounded bg-[#dedad1]"/><div className="mt-4 h-4 w-80 max-w-full rounded bg-[#e6e2da]"/><div className="mt-8 h-16 rounded-xl bg-white"/><div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{[0,1,2].map(v=><div key={v} className="h-80 rounded-xl bg-white shadow-sm"/>)}</div></section>;
}
