export const STUDIO_IMAGE_PREVIEW_EXTENSIONS=["jpg","jpeg","png","webp","svg"] as const;
export type StudioPreviewKind="image"|"pdf"|"unsupported";
export type StudioPreviewFit="width"|"screen"|"actual";
export type StudioPreviewSource={url:string;downloadUrl:string;name:string;extension:string;mimeType:string;versionNumber:number;revisionCode:string;sizeLabel:string;uploadedBy:string;createdAt:string;updatedAt:string;syncStatus:"pending"|"synced"|"error"|"action_required";isCurrent:boolean};
