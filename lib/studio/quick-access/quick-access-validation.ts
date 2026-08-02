import {STUDIO_FAVORITE_ENTITY_TYPES,STUDIO_RECENT_ENTITY_TYPES,type StudioFavoriteEntityType,type StudioRecentEntityType} from "./quick-access-types";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function parseFavoriteEntityType(value:string):StudioFavoriteEntityType{if(!STUDIO_FAVORITE_ENTITY_TYPES.includes(value as StudioFavoriteEntityType))throw new Error("Geçersiz favori kayıt türü.");return value as StudioFavoriteEntityType;}
export function parseRecentEntityType(value:string):StudioRecentEntityType{if(!STUDIO_RECENT_ENTITY_TYPES.includes(value as StudioRecentEntityType))throw new Error("Geçersiz son açılan kayıt türü.");return value as StudioRecentEntityType;}
export function parseEntityId(value:string){if(!UUID.test(value))throw new Error("Geçersiz kayıt kimliği.");return value;}
