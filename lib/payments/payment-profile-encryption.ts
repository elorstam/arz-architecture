import {createCipheriv,createDecipheriv,randomBytes}from"node:crypto";

function key(){const raw=process.env.PAYMENT_PROFILE_ENCRYPTION_KEY;if(!raw)throw new Error("PAYMENT_PROFILE_ENCRYPTION_KEY_MISSING");const value=Buffer.from(raw,"base64");if(value.length!==32)throw new Error("PAYMENT_PROFILE_ENCRYPTION_KEY_INVALID");return value;}
export function assertPaymentProfileEncryptionConfigured(){void key();}
export function encryptPaymentIdentity(value:string){const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key(),iv),encrypted=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);return`v1.${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;}
export function decryptPaymentIdentity(value:string){const[version,iv,tag,data]=value.split(".");if(version!=="v1"||!iv||!tag||!data)throw new Error("PAYMENT_PROFILE_CIPHERTEXT_INVALID");const decipher=createDecipheriv("aes-256-gcm",key(),Buffer.from(iv,"base64url"));decipher.setAuthTag(Buffer.from(tag,"base64url"));return Buffer.concat([decipher.update(Buffer.from(data,"base64url")),decipher.final()]).toString("utf8");}
export function maskedPaymentIdentity(value:string){return`*********${value.slice(-2)}`;}
export function decryptCheckoutPaymentIdentity(encrypted:string,lastTwo:string|null|undefined){
 let identity:string;
 try{identity=decryptPaymentIdentity(encrypted);}catch(error){const code=error instanceof Error?error.message:"";if(code==="PAYMENT_PROFILE_ENCRYPTION_KEY_MISSING"||code==="PAYMENT_PROFILE_ENCRYPTION_KEY_INVALID")throw error;throw new Error("PAYMENT_PROFILE_DECRYPT_FAILED");}
 if(!/^[0-9]{11}$/.test(identity)||!lastTwo||identity.slice(-2)!==lastTwo)throw new Error("PAYMENT_PROFILE_DECRYPT_FAILED");
 return identity;
}
