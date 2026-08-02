export const STUDIO_THUMBNAIL_STATUSES=["pending","generating","ready","failed","unsupported"]as const;
export type StudioThumbnailStatus=(typeof STUDIO_THUMBNAIL_STATUSES)[number];
export type StudioFileThumbnail={id:string;logicalFileId:string;fileVersionId:string;status:StudioThumbnailStatus;width:number;height:number;mimeType:string;sourceHash:string;regeneratedAt:string;url:string;previewReady:boolean};
export const STUDIO_THUMBNAIL_MIME_TYPES=["image/jpeg","image/png","image/webp","image/svg+xml","application/pdf"]as const;
export function supportsStudioThumbnail(mimeType:string){return STUDIO_THUMBNAIL_MIME_TYPES.includes(mimeType.toLowerCase()as(typeof STUDIO_THUMBNAIL_MIME_TYPES)[number]);}
export function isRenderPreviewReady(category:string,mimeType:string,status:StudioThumbnailStatus){return category==="render"&&supportsStudioThumbnail(mimeType)&&status==="ready";}
