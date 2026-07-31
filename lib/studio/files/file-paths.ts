export function sanitizeStorageFileName(name:string){
 const base=name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\\/]+/g,"-").replace(/\.\.+/g,".").replace(/[^a-zA-Z0-9._-]/g,"-").replace(/-+/g,"-").replace(/^[.-]+|[.-]+$/g,"");
 return(base||"file").slice(0,180);
}
export function buildStudioFilePath(organizationId:string,projectId:string,fileId:string,fileName:string){return`organizations/${organizationId}/projects/${projectId}/files/${fileId}/${sanitizeStorageFileName(fileName)}`;}
export function safeDownloadName(name:string){return name.replace(/[\r\n"\\/]/g,"-").trim().slice(0,240)||"dosya";}
