import {StudioFileError} from "../file-errors";
import {getStudioPreviewKind} from "./preview-utils";

export function assertStudioPreviewSupported(extension:string,mimeType:string){
 const kind=getStudioPreviewKind(extension,mimeType);
 if(kind==="unsupported")throw new StudioFileError("invalid_file","Bu dosya türü önizlemeyi desteklemiyor.");
 return kind;
}
