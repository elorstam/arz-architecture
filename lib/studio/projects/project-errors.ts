export class StudioProjectError extends Error{
 readonly code:"unauthorized"|"forbidden"|"not_found"|"duplicate_code"|"invalid_responsible"|"database";
 constructor(code:StudioProjectError["code"],message:string){super(message);this.code=code;this.name="StudioProjectError";}
}
export function normalizeProjectError(error:unknown){
 const value=error as{code?:string;message?:string}|null;
 if(value?.code==="23505")return new StudioProjectError("duplicate_code","Bu proje kodu daha önce kullanılmış.");
 if(value?.message?.includes("Responsible user"))return new StudioProjectError("invalid_responsible","Seçilen sorumlu bu organizasyonda aktif değil.");
 return error instanceof StudioProjectError?error:new StudioProjectError("database","Proje işlemi şu anda tamamlanamadı.");
}
