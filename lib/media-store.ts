import 'server-only';
import {isSupabaseConfigured,supabaseDelete,supabaseSelect,supabaseStorageDelete,supabaseUpsert} from '@/lib/supabase-rest';
import type {MediaItem} from '@/types/cms';
type Row={id:string;filename:string;storage_path:string;url:string;mime_type:string;size_bytes:number;width:number|null;height:number|null;alt_texts:Record<string,string>;created_at:string};
const fromRow=(r:Row):MediaItem=>({id:r.id,filename:r.filename,storagePath:r.storage_path,url:r.url,mimeType:r.mime_type,sizeBytes:r.size_bytes,width:r.width,height:r.height,altTexts:r.alt_texts||{},createdAt:r.created_at});
export async function getMedia(){if(!isSupabaseConfigured())return [];return (await supabaseSelect<Row>('media','select=*&order=created_at.desc')).map(fromRow);}
export async function saveMedia(item:MediaItem){await supabaseUpsert('media',{id:item.id,filename:item.filename,storage_path:item.storagePath,url:item.url,mime_type:item.mimeType,size_bytes:item.sizeBytes,width:item.width,height:item.height,alt_texts:item.altTexts});return item;}
export async function deleteMedia(id:string){const item=(await getMedia()).find(x=>x.id===id);if(!item)return;await supabaseStorageDelete('media',[item.storagePath]);await supabaseDelete('media',`id=eq.${encodeURIComponent(id)}`);}
