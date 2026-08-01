const metadataKeys=new Set(["project_id","source_record_id","locale","tone","output_format","request_duration_ms","response_status","text_length"]);
export function safeAiMetadata(value:Record<string,string|number|boolean|null>){return Object.fromEntries(Object.entries(value).filter(([key,item])=>metadataKeys.has(key)&&(["string","number","boolean"].includes(typeof item)||item===null)));}
