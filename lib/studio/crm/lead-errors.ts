export class StudioLeadError extends Error{
 readonly code:"unauthorized"|"forbidden"|"not_found"|"invalid_assignee"|"database";
 constructor(code:StudioLeadError["code"],message:string){super(message);this.code=code;this.name="StudioLeadError";}
}
export function normalizeLeadError(error:unknown){
 const value=error as{message?:string}|null;
 if(value?.message?.includes("Assigned user"))return new StudioLeadError("invalid_assignee","Seçilen sorumlu kullanıcı bu organizasyona ait değil.");
 return error instanceof StudioLeadError?error:new StudioLeadError("database","CRM işlemi şu anda tamamlanamadı.");
}
