export class StudioQuoteError extends Error{
 readonly code:"unauthorized"|"forbidden"|"not_found"|"invalid_lead"|"invalid_assignee"|"read_only"|"invalid_transition"|"already_converted"|"duplicate_project_code"|"financial"|"database";
 constructor(code:StudioQuoteError["code"],message:string){super(message);this.code=code;this.name="StudioQuoteError";}
}
export function normalizeQuoteError(error:unknown){
 const value=error as{code?:string;message?:string}|null;const message=value?.message??"";
 if(value?.code==="23505"&&message.includes("studio_projects"))return new StudioQuoteError("duplicate_project_code","Proje kodu bu organizasyonda zaten kullanılıyor.");
 if(message.includes("Lead unavailable"))return new StudioQuoteError("invalid_lead","Seçilen lead bu organizasyona ait değil veya arşivlenmiş.");
 if(message.includes("Responsible user"))return new StudioQuoteError("invalid_assignee","Seçilen sorumlu kullanıcı bu organizasyona ait değil.");
 if(message.includes("read only")||message.includes("immutable"))return new StudioQuoteError("read_only","Bu teklif gönderildikten sonra düzenlenemez.");
 if(message.includes("Only approved"))return new StudioQuoteError("invalid_transition","Yalnız onaylanan teklifler projeye dönüştürülebilir.");
 if(message.includes("Invalid quote transition")||message.includes("validity expired"))return new StudioQuoteError("invalid_transition","Bu durum geçişi teklifin mevcut durumunda kullanılamaz.");
 if(message.includes("Discount")||message.includes("financial")||message.includes("quote item"))return new StudioQuoteError("financial","Teklif finansal değerleri doğrulanamadı.");
 return error instanceof StudioQuoteError?error:new StudioQuoteError("database","Teklif işlemi şu anda tamamlanamadı.");
}
