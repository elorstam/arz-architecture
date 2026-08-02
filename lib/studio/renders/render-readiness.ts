import "server-only";

export type RenderArchiveErrorKind = "schema_missing" | "schema_cache" | "permission" | "network" | "database" | "mapper";
export type RenderArchiveLoadError = { kind: RenderArchiveErrorKind; operation: string; sqlState?: string; postgrestCode?: string; relation?: string; function?: string; constraint?: string; sanitizedMessage: string };
type UnknownError = { code?: unknown; message?: unknown; details?: unknown };
const text=(value:unknown)=>typeof value==="string"&&value.length>0?value:undefined;
export function classifyRenderArchiveError(error:unknown,operation:string):RenderArchiveLoadError {
 const value=(error&&typeof error==="object"?error:{}) as UnknownError; const code=text(value.code); const message=text(value.message)??""; const lower=message.toLowerCase(); let kind:RenderArchiveErrorKind="database";
 if(code==="42P01"||(lower.includes("does not exist")&&lower.includes("relation"))) kind="schema_missing";
 else if(code==="PGRST205"||code==="PGRST204") kind="schema_cache";
 else if(code==="42501"||code==="PGRST301"||lower.includes("permission denied")||lower==="forbidden"||lower==="unauthorized") kind="permission";
 else if(lower.includes("fetch")||lower.includes("network")||lower.includes("timeout")) kind="network";
 else if(lower.includes("cannot read")||lower.includes("undefined")||lower.includes("mapper")) kind="mapper";
 const safe={schema_missing:"Render Archive schema is not prepared.",schema_cache:"Render Archive schema is outside the API schema cache.",permission:"Render Archive access could not be verified.",network:"Render Archive request could not be completed.",mapper:"Render Archive response could not be read.",database:"Render Archive database operation failed."}[kind];
 return {kind,operation,sqlState:code?.match(/^\d[A-Z0-9]{4}$/)?code:undefined,postgrestCode:code?.startsWith("PGRST")?code:undefined,relation:message.match(/relation ["']?([\w.]+)["']? does not exist/i)?.[1],function:message.match(/function ["']?([\w.]+)["']?/i)?.[1],constraint:message.match(/constraint ["']?([\w.-]+)["']?/i)?.[1],sanitizedMessage:safe};
}
export function logRenderArchiveError(error:RenderArchiveLoadError){if(process.env.NODE_ENV!=="production")console.error("STUDIO_RENDER_ARCHIVE_LOAD_ERROR",{operation:error.operation,sqlState:error.sqlState,postgrestCode:error.postgrestCode,relation:error.relation,function:error.function,constraint:error.constraint,sanitizedMessage:error.sanitizedMessage});}
export function renderArchiveUserMessage(error:RenderArchiveLoadError){switch(error.kind){case "schema_missing":return "Render Arşivi veritabanı şeması henüz hazırlanmadı.";case "schema_cache":return "Render Arşivi şeması mevcut ancak API önbelleği yenilenmelidir.";case "permission":return "Render Arşivi erişim yetkisi doğrulanamadı.";default:return "Render Arşivi şu anda yüklenemedi.";}}
