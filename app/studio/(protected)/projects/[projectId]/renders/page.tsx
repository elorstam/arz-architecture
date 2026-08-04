import Link from "next/link";
import {notFound} from "next/navigation";
import {Images,SlidersHorizontal} from "lucide-react";

import {attachRenderFileAction,createRenderCategoryAction} from "./actions";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
import StudioRenderArchiveView from "@/components/studio/renders/StudioRenderArchive";
import StudioRenderCategoryManager from "@/components/studio/renders/StudioRenderCategoryManager";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {StudioIcon,type StudioIconName} from "@/components/studio/StudioIcons";
import {StudioCard,StudioEmptyState,StudioIconSurface,StudioPageHeader} from "@/components/studio/ui";
import {getStudioProjectAccess,getStudioProjectById} from "@/lib/studio/projects/project-repository";
import {getRenderArchive,initializeRenderCategories} from "@/lib/studio/renders/render-repository";
import {classifyRenderArchiveError,logRenderArchiveError,renderArchiveUserMessage,type RenderArchiveLoadError} from "@/lib/studio/renders/render-readiness";

export const dynamic="force-dynamic";

const formatSize=(bytes:number)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:1}).format(bytes<1024*1024?bytes/1024:bytes/(1024*1024))+(bytes<1024*1024?" KB":" MB");

function RenderMetric({label,value,detail,icon,tone,href}:{label:string;value:string|number;detail:string;icon:StudioIconName;tone:"blue"|"green"|"purple"|"orange"|"slate"|"red";href:string}){
 return <Link href={href} className="studio-render-metric group"><StudioIconSurface icon={icon} tone={tone} size="md"/><strong>{value}</strong><span>{label}</span><small>{detail}</small><StudioIcon name="chevron-right" className="studio-render-metric__arrow"/></Link>;
}

export default async function Page({params,searchParams}:{params:Promise<{projectId:string}>;searchParams:Promise<Record<string,string|undefined>>}){
 const[{projectId},query]=await Promise.all([params,searchParams]);
 const[project,access]=await Promise.all([getStudioProjectById(projectId),getStudioProjectAccess()]);
 if(!project)notFound();
 let archive:Awaited<ReturnType<typeof getRenderArchive>>|null=null;
 let loadError:RenderArchiveLoadError|null=null;
 try{
  if(access.canManage){
   try{await initializeRenderCategories(projectId);}
   catch(error){const initializeOperation="initializeRenderCategories";void "initialize_render_categories";const e=classifyRenderArchiveError(error,initializeOperation);logRenderArchiveError(e);if(e.kind!=="schema_missing"&&e.kind!=="schema_cache")loadError=e;}
  }
  if(!loadError)archive=await getRenderArchive(projectId,{category:query.category||undefined,favoritesOnly:query.favorites==="1",presented:query.presented==="1"?true:undefined,hero:query.hero==="1",uploader:query.uploader||undefined,dateFrom:query.from,dateTo:query.to,tagIds:query.tag?[query.tag]:undefined});
 }catch(error){const operation=error&&typeof error==="object"&&typeof(error as {renderOperation?:unknown}).renderOperation==="string"?(error as {renderOperation:string}).renderOperation:"getRenderArchive";void "load_render_archive";const e=classifyRenderArchiveError(error,operation);logRenderArchiveError(e);loadError=e;}
 const status=loadError?renderArchiveUserMessage(loadError):null;
 const base=`/studio/projects/${projectId}/renders`;
 const activeCategories=archive?.categories.filter(item=>!item.isArchived)??[];
 const category=(needle:string)=>activeCategories.find(item=>item.name.toLocaleLowerCase("tr-TR").includes(needle));
 const categoryMetric=(needle:string)=>{const match=category(needle);return {count:match?archive?.renders.filter(item=>item.categoryId===match.id).length??0:0,href:match?`${base}?category=${match.id}`:base};};
 const interior=categoryMetric("iç mekan"),exterior=categoryMetric("dış cephe"),night=categoryMetric("gece"),day=categoryMetric("gündüz");
 const storage=archive?.renders.reduce((sum,item)=>sum+item.file.fileSize,0)??0;

 return <main className="studio-render-workspace mx-auto w-full max-w-[1540px] px-4 py-5 sm:px-6 lg:px-8">
  <StudioPageHeader eyebrow={project.code} title="Render Arşivi" description="Projelere ait tüm render görsellerini ve revizyonlarını yönetin." back={<StudioIconSurface tone="blue" size="sm" aria-label="Render Arşivi"><Images className="block size-5" strokeWidth={2.2}/></StudioIconSurface>} actions={archive?.canManage?<><a href="#render-add" className={studioButtonClass("primary","sm")}><StudioIcon name="plus"/>Yeni Render</a><a href="#render-category" className={studioButtonClass("outline","sm")}><StudioIcon name="folder"/>Kategori Oluştur</a></>:undefined}/>
  <StudioProjectTabs projectId={projectId} active="renders"/>
  {archive?<>
   <section className="studio-render-metrics" aria-label="Render arşivi özeti">
    <RenderMetric label="Toplam Render" value={archive.renders.length} detail="Arşivdeki görseller" icon="image" tone="blue" href={base}/>
    <RenderMetric label="İç Mekan" value={interior.count} detail="İç mekan renderları" icon="armchair" tone="purple" href={interior.href}/>
    <RenderMetric label="Dış Cephe" value={exterior.count} detail="Cephe görselleri" icon="building" tone="orange" href={exterior.href}/>
    <RenderMetric label="Gece Renderı" value={night.count} detail="Gece çalışmaları" icon="sparkles" tone="slate" href={night.href}/>
    <RenderMetric label="Gündüz Renderı" value={day.count} detail="Gündüz çalışmaları" icon="render" tone="green" href={day.href}/>
    <RenderMetric label="Sunulan" value={archive.renders.filter(item=>item.presentedAt).length} detail="Müşteriye sunuldu" icon="check" tone="green" href={`${base}?presented=1`}/>
    <RenderMetric label="Favoriler" value={archive.renders.filter(item=>item.isFavorite).length} detail="Öne çıkan renderlar" icon="star" tone="red" href={`${base}?favorites=1`}/>
    <RenderMetric label="Toplam Depolama" value={formatSize(storage)} detail="Render dosyaları" icon="archive" tone="slate" href={base}/>
   </section>

   <StudioCard as="section" className="studio-render-toolbar p-3"><form className="grid min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
    <select name="category" defaultValue={query.category??""} aria-label="Render kategorisi" className="studio-field"><option value="">Tüm kategoriler</option>{activeCategories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
    <select name="tag" defaultValue={query.tag??""} aria-label="Render etiketi" className="studio-field"><option value="">Tüm etiketler</option>{[...new Set(archive.renders.flatMap(item=>item.tags))].map(tag=><option key={tag} value={tag}>{tag}</option>)}</select>
    <select name="uploader" defaultValue={query.uploader??""} aria-label="Yükleyen" className="studio-field"><option value="">Tüm kullanıcılar</option>{[...new Set(archive.renders.map(item=>item.file.uploadedByName))].map(name=><option key={name} value={name}>{name}</option>)}</select>
    <input name="from" type="date" defaultValue={query.from} aria-label="Başlangıç tarihi" className="studio-field"/>
    <input name="to" type="date" defaultValue={query.to} aria-label="Bitiş tarihi" className="studio-field"/>
    <button className={studioButtonClass("secondary","sm","studio-render-filter-button")}><SlidersHorizontal className="block size-4" strokeWidth={2.2}/>Filtrele</button>
    <div className="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-6"><label className="studio-render-check"><input type="checkbox" name="favorites" value="1" defaultChecked={query.favorites==="1"}/>Favoriler</label><label className="studio-render-check"><input type="checkbox" name="presented" value="1" defaultChecked={query.presented==="1"}/>Sunulanlar</label><label className="studio-render-check"><input type="checkbox" name="hero" value="1" defaultChecked={query.hero==="1"}/>Kapak Renderı</label></div>
   </form></StudioCard>

   {archive.canManage?<><section className="studio-render-create-grid"><StudioCard as="section" className="p-4" ><form id="render-add" action={attachRenderFileAction.bind(null,projectId)} className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,.7fr)_auto] sm:items-end"><label className="studio-render-control"><span>Render dosyası</span><select name="fileId" required className="studio-field"><option value="">Dosya seçin</option>{archive.attachableFiles.map(file=><option key={file.id} value={file.id}>{file.name} · {file.extension.toUpperCase()}</option>)}</select></label><label className="studio-render-control"><span>Kategori</span><select name="categoryId" className="studio-field"><option value="">Diğer</option>{activeCategories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className={studioButtonClass("primary","sm")}>Arşive Ekle</button></form></StudioCard><StudioCard as="section" className="p-4"><form id="render-category" action={createRenderCategoryAction.bind(null,projectId)} className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end"><label className="studio-render-control min-w-0 flex-1"><span>Yeni kategori</span><input name="name" required minLength={2} maxLength={80} className="studio-field" placeholder="Kategori adı"/></label><button className={studioButtonClass("outline","sm")}>Kategori Ekle</button></form></StudioCard></section><StudioRenderCategoryManager projectId={projectId} categories={archive.categories}/></>:null}
   <StudioRenderArchiveView archive={archive}/>
  </>:<StudioCard className="mt-4 p-4"><StudioEmptyState icon="warning" title="Render Arşivi yüklenemedi" description={status??"Render Arşivi verileri bulunamadı."}/></StudioCard>}
 </main>;
}
