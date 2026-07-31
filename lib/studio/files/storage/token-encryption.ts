import "server-only";
import {createCipheriv,createDecipheriv,randomBytes} from "node:crypto";
import {createHash} from "node:crypto";
function createHashKey(value:string){if(!value||value.length<32)throw new Error("STUDIO_STORAGE_ENCRYPTION_KEY yapılandırılmamış veya çok kısa.");return createHash("sha256").update(value).digest();}
export function encryptToken(value:string){const iv=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",createHashKey(process.env.STUDIO_STORAGE_ENCRYPTION_KEY!),iv);const encrypted=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;}
export function decryptToken(value:string){const [iv,tag,data]=value.split(".");if(!iv||!tag||!data)throw new Error("Token şifreli formatı geçersiz.");const decipher=createDecipheriv("aes-256-gcm",createHashKey(process.env.STUDIO_STORAGE_ENCRYPTION_KEY!),Buffer.from(iv,"base64url"));decipher.setAuthTag(Buffer.from(tag,"base64url"));return Buffer.concat([decipher.update(Buffer.from(data,"base64url")),decipher.final()]).toString("utf8");}
