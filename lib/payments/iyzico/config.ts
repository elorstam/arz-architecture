import "server-only";
import {z} from "zod";

const schema=z.object({
 apiKey:z.string().min(1),secretKey:z.string().min(1),
 baseUrl:z.url().transform(value=>value.replace(/\/$/,"")),callbackUrl:z.url(),
});

export type IyzicoConfig=z.infer<typeof schema>;
export function getIyzicoConfig():IyzicoConfig|null{
 const parsed=schema.safeParse({apiKey:process.env.IYZICO_API_KEY,secretKey:process.env.IYZICO_SECRET_KEY,baseUrl:process.env.IYZICO_BASE_URL,callbackUrl:process.env.IYZICO_CALLBACK_URL});
 if(!parsed.success)return null;
 const base=new URL(parsed.data.baseUrl),callback=new URL(parsed.data.callbackUrl);
 if(base.protocol!=="https:"||base.hostname!=="sandbox-api.iyzipay.com"||callback.protocol!=="https:")return null;
 return parsed.data;
}
