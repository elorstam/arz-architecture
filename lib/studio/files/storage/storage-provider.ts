export type StudioStorageProvider="supabase"|"google_drive";

export type ExternalObjectMetadata={
 id:string; name:string; mimeType?:string; size?:number; parents:string[];
 checksum?:string; version?:string; modifiedTime?:string; trashed:boolean;
 appProperties:Record<string,string>;
};

export type ExternalVerification={exists:boolean;metadata?:ExternalObjectMetadata};

export interface StudioStorageOperations {
 downloadFile(organizationId:string,fileId:string):Promise<Response>;
 renameFile(organizationId:string,fileId:string,name:string):Promise<ExternalObjectMetadata>;
 moveFile(organizationId:string,fileId:string,fromParentId:string,toParentId:string):Promise<ExternalObjectMetadata>;
 archiveFile(organizationId:string,fileId:string,fromParentId:string,archiveParentId:string):Promise<ExternalObjectMetadata>;
 restoreFile(organizationId:string,fileId:string,fromParentId:string,toParentId:string):Promise<ExternalObjectMetadata>;
 createFolder(organizationId:string,name:string,parentId:string,appProperties:Record<string,string>):Promise<ExternalObjectMetadata>;
 renameFolder(organizationId:string,folderId:string,name:string):Promise<ExternalObjectMetadata>;
 moveFolder(organizationId:string,folderId:string,fromParentId:string,toParentId:string):Promise<ExternalObjectMetadata>;
 archiveFolder(organizationId:string,folderId:string,fromParentId:string,archiveParentId:string):Promise<ExternalObjectMetadata>;
 restoreFolder(organizationId:string,folderId:string,fromParentId:string,toParentId:string):Promise<ExternalObjectMetadata>;
 verifyFileExists(organizationId:string,fileId:string):Promise<ExternalVerification>;
 verifyFolderExists(organizationId:string,folderId:string):Promise<ExternalVerification>;
 getFileMetadata(organizationId:string,fileId:string):Promise<ExternalObjectMetadata>;
 getFolderMetadata(organizationId:string,folderId:string):Promise<ExternalObjectMetadata>;
}

export {googleDriveStorageProvider} from "./google-drive-provider";
