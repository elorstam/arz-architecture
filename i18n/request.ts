import {getRequestConfig} from "next-intl/server";
import {hasLocale} from "next-intl";

import {routing} from "./routing";
import {getSiteMessages} from "@/lib/site-translation-store";
function unflatten(values:Record<string,string>){const root:Record<string,unknown>={};for(const[key,value]of Object.entries(values)){const parts=key.split('.');let cursor=root;parts.forEach((part,index)=>{if(index===parts.length-1)cursor[part]=value;else{cursor[part]??={};cursor=cursor[part] as Record<string,unknown>;}});}return root;}
function merge(base:Record<string,unknown>,overrides:Record<string,unknown>):Record<string,unknown>{const result={...base};for(const[key,value]of Object.entries(overrides)){result[key]=value&&typeof value==='object'&&!Array.isArray(value)?merge((result[key] as Record<string,unknown>)||{},value as Record<string,unknown>):value;}return result;}

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;

  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  const bundled = (await import(`../messages/${locale}.json`)).default;
  const cms = await getSiteMessages(locale);
  const nested=unflatten(cms);
  return {
    locale,
    messages: {...merge(bundled,nested), CMS: nested},
  };
});
