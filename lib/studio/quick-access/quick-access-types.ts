export const STUDIO_FAVORITE_ENTITY_TYPES=["project","crm_lead","quote","file","folder","file_version"] as const;
export const STUDIO_RECENT_ENTITY_TYPES=["project","crm_lead","quote","file","folder"] as const;
export type StudioFavoriteEntityType=(typeof STUDIO_FAVORITE_ENTITY_TYPES)[number];
export type StudioRecentEntityType=(typeof STUDIO_RECENT_ENTITY_TYPES)[number];
export type StudioQuickAccessItem={key:string;entityType:StudioFavoriteEntityType;entityId:string;title:string;subtitle:string;url:string;isFavorite:boolean;lastOpenedAt?:string};
export type StudioQuickAccessData={available:boolean;favorites:StudioQuickAccessItem[];recent:StudioQuickAccessItem[]};
