import Link from "next/link";
import {Cuboid,DraftingCompass,FileStack,FileText,Folder,HardDrive,Images,type LucideIcon} from "lucide-react";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {StudioIcon} from "@/components/studio/StudioIcons";
import {StudioCard,StudioIconSurface,StudioPageHeader,StudioSectionHeader} from "@/components/studio/ui";
import StudioFavoriteButton from "@/components/studio/quick-access/StudioFavoriteButton";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
import {STUDIO_CATEGORY_LABELS,STUDIO_FILE_CATEGORIES} from "@/lib/studio/files/file-constants";
import type {StudioFileWorkspace} from "@/lib/studio/files/file-types";
import type {StudioFileThumbnail} from "@/lib/studio/files/thumbnails/thumbnail-types";
import StudioFileUpload from "./StudioFileUpload";
import StudioFolderActions from "./StudioFolderActions";
import StudioFolderForm from "./StudioFolderForm";
import StudioSyncStatus from "./StudioSyncStatus";
import StudioVisualFileBrowser from "./StudioVisualFileBrowser";

const FILE_KPI_ICON_MAP={
 totalFiles:{Icon:FileStack,tone:"blue",iconClassName:""},
 folders:{Icon:Folder,tone:"orange",iconClassName:""},
 pdf:{Icon:FileText,tone:"red",iconClassName:""},
 dwg:{Icon:DraftingCompass,tone:"blue",iconClassName:""},
 skp:{Icon:Cuboid,tone:"purple",iconClassName:""},
 render:{Icon:Images,tone:"orange",iconClassName:""},
 totalSize:{Icon:HardDrive,tone:"slate",iconClassName:""},
} as const satisfies Record<string,{Icon:LucideIcon;tone:"blue"|"green"|"purple"|"orange"|"slate"|"red";iconClassName:string}>;

type FileKpiIconKey=keyof typeof FILE_KPI_ICON_MAP;

const typeMetrics=[
  {label:"PDF",extension:"pdf",iconKey:"pdf" as const},
  {label:"DWG",extension:"dwg",iconKey:"dwg" as const},
  {label:"SKP",extension:"skp",iconKey:"skp" as const},
  {label:"Render",extension:"image",iconKey:"render" as const},
];

export default function StudioProjectFilesPage({workspace,favoriteKeys,favoritesOnly=false,thumbnails={},tags={}}:{workspace:StudioFileWorkspace;favoriteKeys:Set<string>;favoritesOnly?:boolean;thumbnails?:Record<string,StudioFileThumbnail>;tags?:Record<string,string[]>}){
 const folderId=workspace.currentFolder?.id??"";
 const count=(extension:string)=>extension==="image"?workspace.files.filter(file=>["jpg","jpeg","png","webp","tif","tiff"].includes(file.extension.toLowerCase())).length:workspace.files.filter(file=>file.extension.toLowerCase()===extension).length;
 const metrics=[
  {label:"Toplam Dosya",value:workspace.summary.fileCount,detail:"Proje dokümanları",iconKey:"totalFiles" as const,href:`/studio/projects/${workspace.project.id}/files`},
  {label:"Toplam Klasör",value:workspace.summary.folderCount,detail:"Aktif çalışma alanları",iconKey:"folders" as const,href:`/studio/projects/${workspace.project.id}/files`},
  ...typeMetrics.map(item=>({...item,value:count(item.extension),detail:`${item.label} dosyaları`,href:item.extension==="image"?`/studio/projects/${workspace.project.id}/files${folderId?`?folder=${folderId}`:""}`:`/studio/projects/${workspace.project.id}/files?${folderId?`folder=${folderId}&`:""}extension=${item.extension}`})),
  {label:"Toplam Boyut",value:workspace.summary.storageLabel,detail:"Kullanılan depolama",iconKey:"totalSize" as const,href:`/studio/projects/${workspace.project.id}/files`},
 ];
 const iconFor=(iconKey:FileKpiIconKey)=>FILE_KPI_ICON_MAP[iconKey];
 return <section className="studio-files-workspace mx-auto w-full min-w-0 max-w-[1540px] px-4 py-5 sm:px-6 lg:px-8">
  <StudioPageHeader eyebrow={`${workspace.project.code} · ${workspace.project.name}`} title="Dosyalar" description="Projeye ait tüm teknik dokümanlar, çizimler ve teslim dosyaları." icon="folder" back={<Link href={`/studio/projects/${workspace.project.id}`} className="studio-files-back" aria-label="Proje genel bakışına dön"><StudioIcon name="arrow"/> Projeye Dön</Link>} actions={workspace.canManage?<><a href="#file-upload" className={studioButtonClass("primary","sm")}><StudioIcon name="upload"/>Dosya Yükle</a><a href="#new-folder" className={studioButtonClass("outline","sm")}><StudioIcon name="plus"/>Yeni Klasör</a></>:undefined}/>
  <StudioProjectTabs projectId={workspace.project.id} active="files"/>

  <div className="studio-files-metrics" aria-label="Dosya özeti">{metrics.map(metric=>{const config=iconFor(metric.iconKey);const Icon=config.Icon;return <Link key={metric.label} href={metric.href} className="studio-files-metric group relative flex h-full min-w-0 flex-col items-start p-4"><StudioIconSurface tone={config.tone} size="kpi" className="shrink-0"><Icon className={`studio-icon-surface__icon block size-5 shrink-0 ${config.iconClassName}`} strokeWidth={2.2}/></StudioIconSurface><strong className="studio-files-metric__value" title={String(metric.value)}>{metric.value}</strong><span className="studio-files-metric__title">{metric.label}</span><small className="studio-files-metric__description">{metric.detail}</small><StudioIcon name="chevron-right" className="studio-files-metric__arrow"/></Link>})}</div>

  <nav aria-label="Dosya klasör yolu" className="studio-files-breadcrumb"><Link href={`/studio/projects/${workspace.project.id}/files`}><StudioIcon name="home"/>Proje Kökü</Link>{workspace.breadcrumbs.map(folder=><span key={folder.id}><StudioIcon name="chevron-right"/><span>{folder.name}</span></span>)}</nav>

  <StudioCard as="section" className="studio-files-toolbar p-3"><form className="grid min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_200px_160px_auto_auto]"><input type="hidden" name="folder" value={folderId}/><label className="studio-files-search"><StudioIcon name="search"/><span className="sr-only">Dosyalarda ara</span><input name="q" aria-label="Dosyalarda ara" placeholder="Dosya ara..."/></label><select name="category" aria-label="Dosya türü"><option value="">Tüm dosya türleri</option>{STUDIO_FILE_CATEGORIES.map(value=><option key={value} value={value}>{STUDIO_CATEGORY_LABELS[value]}</option>)}</select><select name="archive" aria-label="Arşiv görünümü"><option value="active">Aktif dosyalar</option><option value="archived">Arşiv</option><option value="all">Tümü</option></select><label className="studio-files-favorite-filter"><input type="checkbox" name="favorites" value="1" defaultChecked={favoritesOnly}/><StudioIcon name="star"/>Favoriler</label><button className={studioButtonClass("secondary","sm")}><StudioIcon name="filter"/>Filtrele</button></form></StudioCard>

  {workspace.canManage?<div className="studio-files-create-panels"><details id="file-upload"><summary><StudioIconSurface icon="upload" tone="blue" size="sm"/><span><strong>Yeni Dosya</strong><small>Güvenli yükleme başlat</small></span><StudioIcon name="chevron-down"/></summary><StudioFileUpload projectId={workspace.project.id} folderId={folderId}/></details><details id="new-folder"><summary><StudioIconSurface icon="folder" tone="orange" size="sm"/><span><strong>Yeni Klasör</strong><small>Doküman alanı oluştur</small></span><StudioIcon name="chevron-down"/></summary><StudioFolderForm projectId={workspace.project.id} parentFolderId={folderId}/></details></div>:null}

  <StudioCard as="section" className="studio-files-folders p-0"><div className="p-4"><StudioSectionHeader title="Klasörler" description="Projenin doküman çalışma alanları" icon="folder" count={workspace.folders.length}/></div>{workspace.folders.length?<div className="studio-files-folder-grid">{workspace.folders.map((folder,index)=><article key={folder.id} className={`studio-files-folder studio-files-folder--${["blue","purple","orange","green"][index%4]}`}><div className="absolute right-3 top-3 z-10"><StudioFavoriteButton entityType="folder" entityId={folder.id} initialFavorite={favoriteKeys.has(`folder:${folder.id}`)} compact/></div><Link href={`/studio/projects/${workspace.project.id}/files?folder=${folder.id}`}><StudioIconSurface icon="folder" tone={(["blue","purple","orange","green"] as const)[index%4]} size="lg"/><div className="min-w-0"><h3>{folder.name}</h3><p>{folder.isSystem?"Sistem klasörü":"Özel klasör"}</p><time>{new Intl.DateTimeFormat("tr-TR",{dateStyle:"medium"}).format(new Date(folder.updatedAt))}</time></div><StudioIcon name="chevron-right" className="ml-auto h-4 w-4"/></Link><div className="studio-files-folder__footer"><StudioSyncStatus status={folder.syncStatus}/>{workspace.canManage?<StudioFolderActions projectId={workspace.project.id} folder={folder} folders={workspace.availableFolders}/>:null}</div></article>)}</div>:<div className="studio-files-empty"><StudioIconSurface icon="folder" tone="slate" size="lg"/><h3>Bu konumda klasör bulunmuyor.</h3><p>Yeni bir klasör oluşturarak dokümanları düzenleyebilirsiniz.</p></div>}</StudioCard>

  <StudioCard as="section" className="studio-files-browser p-0" aria-labelledby="visual-files-title"><div className="p-4"><StudioSectionHeader title="Dosyalar" description="Teknik dokümanlar, çizimler ve teslim içerikleri" icon="files" count={workspace.files.length}/></div><StudioVisualFileBrowser projectId={workspace.project.id} files={workspace.files} favoriteKeys={[...favoriteKeys]} thumbnails={thumbnails} tags={tags} favoritesOnly={favoritesOnly}/></StudioCard>
 </section>;
}
