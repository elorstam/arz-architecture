import "server-only";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import {STUDIO_FILES_BUCKET,STUDIO_FILE_SIGNED_URL_SECONDS} from "./file-constants";
import {StudioFileError} from "./file-errors";
export async function createSignedFileUpload(storagePath:string){const supabase=await createStudioServerClient();const{data,error}=await supabase.storage.from(STUDIO_FILES_BUCKET).createSignedUploadUrl(storagePath,{upsert:false});if(error||!data)throw new StudioFileError("storage","Güvenli yükleme bağlantısı oluşturulamadı.");return{path:data.path,token:data.token};}
export async function createSignedFileDownload(storagePath:string,downloadName:string){const supabase=await createStudioServerClient();const{data,error}=await supabase.storage.from(STUDIO_FILES_BUCKET).createSignedUrl(storagePath,STUDIO_FILE_SIGNED_URL_SECONDS,{download:downloadName});if(error||!data?.signedUrl)throw new StudioFileError("storage","Dosya Storage üzerinde bulunamadı.");return data.signedUrl;}
export async function cleanupStorageObject(storagePath:string){const supabase=await createStudioServerClient();await supabase.storage.from(STUDIO_FILES_BUCKET).remove([storagePath]);}
