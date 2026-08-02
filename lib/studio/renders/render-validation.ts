import {z} from "zod";
export const renderCategorySchema=z.string().normalize("NFC").trim().min(2,"Kategori adı çok kısa.").max(80,"Kategori adı çok uzun.");
export const renderMetadataSchema=z.object({title:z.string().normalize("NFC").trim().min(2).max(180),description:z.string().normalize("NFC").trim().max(3000),categoryId:z.string().uuid().nullable(),width:z.number().int().min(1).max(30000).nullable(),height:z.number().int().min(1).max(30000).nullable()});
export function renderAspectRatio(width:number|null,height:number|null){if(!width||!height)return"Belirtilmedi";const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a,d=gcd(width,height);return`${width/d}:${height/d}`;}
