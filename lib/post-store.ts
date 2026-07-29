import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import {isSupabaseConfigured, supabaseDelete, supabaseSelect, supabaseUpsert} from '@/lib/supabase-rest';
import type {ManagedPost} from '@/types/cms';

type Row = {id:string;status:ManagedPost['status'];author:string;cover_url:string|null;category_id:string|null;tag_ids:string[];publish_at:string|null;translations:ManagedPost['translations'];seo:ManagedPost['seo'];slugs:ManagedPost['slugs'];created_at?:string;updated_at?:string};
const file=path.join(process.cwd(),'data','admin-posts.json');
const fromRow=(r:Row):ManagedPost=>({id:r.id,status:r.status,author:r.author,coverUrl:r.cover_url||'',categoryId:r.category_id,tagIds:r.tag_ids||[],publishAt:r.publish_at,translations:r.translations||{},seo:r.seo||{},slugs:r.slugs||{},createdAt:r.created_at,updatedAt:r.updated_at});
const toRow=(p:ManagedPost):Row=>({id:p.id,status:p.status,author:p.author,cover_url:p.coverUrl||null,category_id:p.categoryId,tag_ids:p.tagIds,publish_at:p.publishAt,translations:p.translations,seo:p.seo,slugs:p.slugs});
async function localRead():Promise<ManagedPost[]>{try{return JSON.parse(await fs.readFile(file,'utf8')) as ManagedPost[];}catch{return [];}}
async function localWrite(items:ManagedPost[]){await fs.writeFile(file,JSON.stringify(items,null,2),'utf8');}
export async function getPosts(admin=false){
  let items:ManagedPost[];
  try{
    items=isSupabaseConfigured()? (await supabaseSelect<Row>('posts','select=*&order=publish_at.desc.nullslast')).map(fromRow):await localRead();
  }catch(error){
    console.error('Posts could not be read from Supabase',error);
    if(admin)throw new Error('Blog yazıları şu anda yüklenemiyor.');
    return[];
  }
  if(admin)return items;
  const now=Date.now();
  return items.filter((post)=>{
    if (!post.publishAt || new Date(post.publishAt).getTime() > now) return false;
    return post.status === 'published' || post.status === 'scheduled';
  });
}
export async function getPostBySlug(locale:string,slug:string){return (await getPosts(false)).find(p=>(p.slugs[locale]||p.slugs.tr)===slug);}
export type PostTerm={id:string;slug:string;translations:Record<string,string>};
export async function getPostTerms(){
  if(!isSupabaseConfigured())return{categories:[] as PostTerm[],tags:[] as PostTerm[]};
  try{
    const[categories,tags]=await Promise.all([
      supabaseSelect<PostTerm>('post_categories','select=*&order=slug.asc'),
      supabaseSelect<PostTerm>('post_tags','select=*&order=slug.asc'),
    ]);
    return{categories,tags};
  }catch(error){
    console.error('Post categories or tags could not be read from Supabase',error);
    return{categories:[] as PostTerm[],tags:[] as PostTerm[]};
  }
}
export async function savePost(post:ManagedPost){
  const normalized={...post,updatedAt:new Date().toISOString()};
  if(isSupabaseConfigured()){await supabaseUpsert('posts',toRow(normalized));return normalized;}
  const items=await localRead();const index=items.findIndex(x=>x.id===post.id);if(index>=0)items[index]=normalized;else items.push(normalized);await localWrite(items);return normalized;
}
export async function deletePost(id:string){if(isSupabaseConfigured())return supabaseDelete('posts',`id=eq.${encodeURIComponent(id)}`);await localWrite((await localRead()).filter(x=>x.id!==id));}
