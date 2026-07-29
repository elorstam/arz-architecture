import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import {isSupabaseConfigured,supabaseSelect,supabaseUpsert} from '@/lib/supabase-rest';
import type {SiteTranslation} from '@/types/cms';
import {siteCopy} from '@/data/site-copy';
type Row={key:string;source_tr:string;translations:Record<string,string>;stale_locales:string[];updated_at?:string};
const file=path.join(process.cwd(),'data','site-translations.json');
const fromRow=(r:Row):SiteTranslation=>({key:r.key,sourceTr:r.source_tr,translations:r.translations||{},staleLocales:r.stale_locales||[],updatedAt:r.updated_at});
async function read(){try{return JSON.parse(await fs.readFile(file,'utf8')) as SiteTranslation[];}catch{return [];}}
export async function getSiteTranslations(){return isSupabaseConfigured()?(await supabaseSelect<Row>('site_translations','select=*&order=key.asc')).map(fromRow):read();}
export async function saveSiteTranslation(item:SiteTranslation){
  const existing=(await getSiteTranslations()).find(x=>x.key===item.key);
  const stale=existing&&existing.sourceTr!==item.sourceTr?['en','de','fr','es','nl','ar','ja','ko','zh']:item.staleLocales;
  const normalized={...item,staleLocales:stale,updatedAt:new Date().toISOString()};
  if(isSupabaseConfigured()){await supabaseUpsert('site_translations',{key:item.key,source_tr:item.sourceTr,translations:item.translations,stale_locales:stale},'key');return normalized;}
  const items=await read();const i=items.findIndex(x=>x.key===item.key);if(i>=0)items[i]=normalized;else items.push(normalized);await fs.writeFile(file,JSON.stringify(items,null,2),'utf8');return normalized;
}
export async function getSiteMessages(locale:string){const items=await getSiteTranslations();return {...(siteCopy[locale]||siteCopy.tr),...Object.fromEntries(items.map(x=>[x.key,x.translations[locale]||x.sourceTr]))};}
function flatten(value:unknown,prefix=''):Record<string,string>{if(!value||typeof value!=='object')return{};return Object.entries(value).reduce<Record<string,string>>((all,[key,item])=>{const next=prefix?`${prefix}.${key}`:key;if(typeof item==='string')all[next]=item;else Object.assign(all,flatten(item,next));return all;},{});}
export async function seedSiteTranslations(){const existing=await getSiteTranslations();const keys=new Set(existing.map(x=>x.key));const maps:Record<string,Record<string,string>>={};for(const locale of ['tr','en','de','fr','es','nl','ar','ja','ko','zh']){try{maps[locale]=flatten(JSON.parse(await fs.readFile(path.join(process.cwd(),'messages',`${locale}.json`),'utf8')));}catch{maps[locale]={};}maps[locale]={...maps[locale],...(siteCopy[locale]||{})};}let created=0;for(const[key,sourceTr]of Object.entries(maps.tr)){if(keys.has(key))continue;await saveSiteTranslation({key,sourceTr,translations:Object.fromEntries(Object.entries(maps).filter(([locale])=>locale!=='tr').map(([locale,map])=>[locale,map[key]||sourceTr])),staleLocales:[]});created++;}return{created,total:Object.keys(maps.tr).length};}
