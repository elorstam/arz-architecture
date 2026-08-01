import {StudioFileError} from "../file-errors.ts";

function invalidText(operation:string,fieldName:string,value:unknown):never{
 if(process.env.NODE_ENV==="development")console.error("STUDIO_VERSION_TEXT_NORMALIZATION",{operation,fieldName,valueWasNull:value==null,errorCode:"invalid_version_text"});
 throw new StudioFileError("invalid_file","Sürümün zorunlu dosya kimliği geçersiz. Yüklemeyi yeniden oluşturmayın; kayıt onarımı gerekiyor.");
}

export function normalizeRequiredText(value:unknown,fieldName:string,operation="version_recovery"){
 if(typeof value!=="string")return invalidText(operation,fieldName,value);
 const normalized=value.normalize("NFC").trim();
 if(!normalized)return invalidText(operation,fieldName,value);
 return normalized;
}

export function normalizeOptionalText(value:unknown,fieldName="optional_text",operation="version_recovery"){
 if(value==null)return null;
 if(typeof value!=="string")return invalidText(operation,fieldName,value);
 const normalized=value.normalize("NFC").trim();
 return normalized||null;
}
