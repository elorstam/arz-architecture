"use server";
import {revalidatePath} from "next/cache";
import {addFavorite,recordRecentItem,removeFavorite} from "@/lib/studio/quick-access/quick-access-repository";
import {parseEntityId,parseFavoriteEntityType,parseRecentEntityType} from "@/lib/studio/quick-access/quick-access-validation";

export async function setFavoriteAction(entityType:string,entityId:string,favorite:boolean){try{const type=parseFavoriteEntityType(entityType),id=parseEntityId(entityId);if(favorite)await addFavorite(type,id);else await removeFavorite(type,id);revalidatePath("/studio/quick-access");revalidatePath("/studio");return{success:true,favorite,message:favorite?"Favorilere eklendi.":"Favorilerden çıkarıldı."};}catch(error){return{success:false,favorite:!favorite,message:error instanceof Error?error.message:"Favori işlemi tamamlanamadı."};}}
export async function recordRecentItemAction(entityType:string,entityId:string){try{await recordRecentItem(parseRecentEntityType(entityType),parseEntityId(entityId));return{success:true};}catch{return{success:false};}}
