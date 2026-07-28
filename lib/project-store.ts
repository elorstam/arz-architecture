import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import {projects, projectEnglishSlugs, localizeProject, type Project} from '@/data/projects';

export type ManagedProject={id:string;slugTr:string;slugEn:string;published:boolean;order:number;tr:Project;en:Project};
type Store={overrides:Record<string,ManagedProject>;deleted:string[]};
const file=path.join(process.cwd(),'data','admin-projects.json');
async function readStore():Promise<Store>{try{return JSON.parse(await fs.readFile(file,'utf8'));}catch{return {overrides:{},deleted:[]};}}
async function writeStore(store:Store){await fs.writeFile(file,JSON.stringify(store,null,2),'utf8');}
function fromStatic(project:Project,index:number):ManagedProject{return {id:project.slug,slugTr:project.slug,slugEn:projectEnglishSlugs[project.slug]??project.slug,published:true,order:index,tr:project,en:localizeProject(project,'en')};}
export async function getManagedProjects(){const store=await readStore(); const base=projects.map(fromStatic).filter(p=>!store.deleted.includes(p.id)); const map=new Map(base.map(p=>[p.id,p])); Object.values(store.overrides).forEach(p=>map.set(p.id,p)); return [...map.values()].sort((a,b)=>a.order-b.order);}
export async function getLocalizedStoreProjects(locale:string){return (await getManagedProjects()).filter(p=>p.published).map(p=>({...locale==='en'?p.en:p.tr,slug:locale==='en'?p.slugEn:p.slugTr}));}
export async function getManagedBySlug(slug:string){return (await getManagedProjects()).find(p=>p.slugTr===slug||p.slugEn===slug);}
export async function saveManagedProject(project:ManagedProject){const store=await readStore(); store.overrides[project.id]=project; store.deleted=store.deleted.filter(id=>id!==project.id); await writeStore(store); return project;}
export async function deleteManagedProject(id:string){const store=await readStore(); delete store.overrides[id]; if(!store.deleted.includes(id))store.deleted.push(id); await writeStore(store);}
