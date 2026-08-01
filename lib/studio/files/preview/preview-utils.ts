import {STUDIO_IMAGE_PREVIEW_EXTENSIONS,type StudioPreviewKind} from "./preview-types";

export function getStudioPreviewKind(extension:string,mimeType:string):StudioPreviewKind{
 const normalized=extension.trim().toLocaleLowerCase("en-US");
 if((STUDIO_IMAGE_PREVIEW_EXTENSIONS as readonly string[]).includes(normalized)&&mimeType.toLocaleLowerCase("en-US").startsWith("image/"))return"image";
 if(normalized==="pdf"&&mimeType.toLocaleLowerCase("en-US").includes("pdf"))return"pdf";
 return"unsupported";
}

export function buildStudioPreviewUrl(projectId:string,fileId:string,versionId?:string){
 const base=versionId?`/studio/projects/${projectId}/files/${fileId}/versions/${versionId}/download`:`/studio/projects/${projectId}/files/${fileId}/download`;
 return`${base}?preview=1`;
}
