import "server-only";

import {StudioFileError} from "../file-errors";
import type {ExternalObjectMetadata,StudioStorageOperations} from "./storage-provider";
import {getGoogleAccessToken} from "./google-drive-auth";

const DRIVE_FOLDER_MIME="application/vnd.google-apps.folder";
const METADATA_FIELDS="id,name,mimeType,size,parents,md5Checksum,version,modifiedTime,thumbnailLink,trashed,appProperties";

function providerError(status:number){
 if(status===401)return new StudioFileError("reauthorization_required","Google Drive bağlantısının yeniden yetkilendirilmesi gerekiyor.");
 if(status===403)return new StudioFileError("forbidden","Google Drive nesnesi için işlem yetkisi bulunmuyor.");
 if(status===404)return new StudioFileError("not_found","Google Drive nesnesi bulunamadı.");
 return new StudioFileError("storage","Google Drive işlemi geçici olarak tamamlanamadı.");
}

async function drive(organizationId:string,path:string,init:RequestInit={}){
 const token=await getGoogleAccessToken(organizationId);
 const response=await fetch(`https://www.googleapis.com/drive/v3/${path}`,{...init,headers:{Authorization:`Bearer ${token}`,...init.headers},cache:"no-store"});
 if(!response.ok)throw providerError(response.status);
 return response;
}

type RawMetadata={id:string;name:string;mimeType?:string;size?:string;parents?:string[];md5Checksum?:string;version?:string;modifiedTime?:string;thumbnailLink?:string;trashed?:boolean;appProperties?:Record<string,string>};
function metadata(value:RawMetadata):ExternalObjectMetadata{return{id:value.id,name:value.name,mimeType:value.mimeType,size:value.size?Number(value.size):undefined,parents:value.parents??[],checksum:value.md5Checksum,version:value.version,modifiedTime:value.modifiedTime,thumbnailLink:value.thumbnailLink,trashed:Boolean(value.trashed),appProperties:value.appProperties??{}};}
async function readMetadata(organizationId:string,id:string){const response=await drive(organizationId,`files/${encodeURIComponent(id)}?fields=${encodeURIComponent(METADATA_FIELDS)}`);return metadata(await response.json() as RawMetadata);}
async function patchMetadata(organizationId:string,id:string,body:Record<string,unknown>,query=""){const response=await drive(organizationId,`files/${encodeURIComponent(id)}?fields=${encodeURIComponent(METADATA_FIELDS)}${query}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(body)});return metadata(await response.json() as RawMetadata);}
async function move(organizationId:string,id:string,fromParentId:string,toParentId:string){const current=await readMetadata(organizationId,id);if(fromParentId===toParentId||current.parents.includes(toParentId)&&!current.parents.includes(fromParentId))return current;const query=`&addParents=${encodeURIComponent(toParentId)}&removeParents=${encodeURIComponent(fromParentId)}`;return patchMetadata(organizationId,id,{},query);}
async function verify(organizationId:string,id:string,folder:boolean){try{const value=await readMetadata(organizationId,id);if(value.trashed||(folder&&value.mimeType!==DRIVE_FOLDER_MIME)||(!folder&&value.mimeType===DRIVE_FOLDER_MIME))return{exists:false};return{exists:true,metadata:value};}catch(error){if(error instanceof StudioFileError&&error.code==="not_found")return{exists:false};throw error;}}

export async function createDriveFolder(organizationId:string,name:string,parentId:string|undefined,properties:Record<string,string>={}){const response=await drive(organizationId,"files?fields=id,name,mimeType,parents,trashed,appProperties",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,mimeType:DRIVE_FOLDER_MIME,parents:parentId?[parentId]:undefined,appProperties:properties})});return metadata(await response.json() as RawMetadata);}
export async function findDriveFolder(organizationId:string,parentId:string,properties:Record<string,string>){const escaped=(value:string)=>value.replace(/['\\]/g,value=>`\\${value}`);const q=[`'${escaped(parentId)}' in parents`,`mimeType='${DRIVE_FOLDER_MIME}'`,`trashed=false`,...Object.entries(properties).map(([key,value])=>`appProperties has { key='${escaped(key)}' and value='${escaped(value)}' }`)].join(" and ");const response=await drive(organizationId,`files?spaces=drive&pageSize=2&fields=files(${METADATA_FIELDS})&q=${encodeURIComponent(q)}`);const body=await response.json() as {files?:RawMetadata[]};if((body.files??[]).length>1)throw new StudioFileError("storage","Google Drive klasör eşlemesi belirsiz.");return body.files?.[0]?metadata(body.files[0]):null;}
export async function createDriveResumableSession(organizationId:string,input:{name:string;mimeType:string;size:number;parentId:string;appProperties?:Record<string,string>}){const token=await getGoogleAccessToken(organizationId);const response=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json","X-Upload-Content-Type":input.mimeType,"X-Upload-Content-Length":String(input.size)},body:JSON.stringify({name:input.name,parents:[input.parentId],appProperties:input.appProperties}),cache:"no-store"});if(!response.ok)throw providerError(response.status);const location=response.headers.get("location");if(!location)throw new StudioFileError("storage","Google Drive yükleme adresi alınamadı.");return location;}
export async function downloadDriveFile(organizationId:string,fileId:string){return drive(organizationId,`files/${encodeURIComponent(fileId)}?alt=media`);}
export async function getDriveFileMetadata(organizationId:string,fileId:string){return readMetadata(organizationId,fileId);}
export async function downloadDriveThumbnail(organizationId:string,thumbnailLink:string){const url=new URL(thumbnailLink);if(url.protocol!=="https:"||!(url.hostname==="googleusercontent.com"||url.hostname.endsWith(".googleusercontent.com")))throw new StudioFileError("storage","Google Drive thumbnail adresi doğrulanamadı.");const token=await getGoogleAccessToken(organizationId);const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`},cache:"no-store",redirect:"error"});if(!response.ok)throw providerError(response.status);return response;}
export async function updateDriveFile(organizationId:string,fileId:string,body:Record<string,unknown>){return patchMetadata(organizationId,fileId,body);}
export async function copyDriveFile(organizationId:string,fileId:string,input:{name:string;parentId:string;appProperties:Record<string,string>}){const response=await drive(organizationId,`files/${encodeURIComponent(fileId)}/copy?fields=${encodeURIComponent(METADATA_FIELDS)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:input.name,parents:[input.parentId],appProperties:input.appProperties})});return metadata(await response.json() as RawMetadata);}

export const googleDriveStorageProvider:StudioStorageOperations={
 downloadFile:downloadDriveFile,
 renameFile:async(org,id,name)=>{const current=await readMetadata(org,id);return current.name===name?current:patchMetadata(org,id,{name});},
 moveFile:move,
 archiveFile:move,
 restoreFile:move,
 createFolder:async(org,name,parent,props)=>createDriveFolder(org,name,parent,props),
 renameFolder:async(org,id,name)=>{const current=await readMetadata(org,id);return current.name===name?current:patchMetadata(org,id,{name});},
 moveFolder:move,
 archiveFolder:move,
 restoreFolder:move,
 verifyFileExists:(org,id)=>verify(org,id,false),
 verifyFolderExists:(org,id)=>verify(org,id,true),
 getFileMetadata:readMetadata,
 getFolderMetadata:readMetadata,
};

export {getGoogleAccessToken};
