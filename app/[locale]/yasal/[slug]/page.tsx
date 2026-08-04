import type {Metadata} from "next";
import {notFound} from "next/navigation";
import LegalPage from "@/components/legal/LegalPage";
import {locales} from "@/i18n/locales";
import {companyLegalConfig} from "@/lib/legal/company-config";
import {isLegalSlug,legalDocuments,legalSlugs} from "@/lib/legal/legal-content";

type Props={params:Promise<{locale:string;slug:string}>};
export function generateStaticParams(){return locales.flatMap(locale=>legalSlugs.map(slug=>({locale,slug})));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale,slug}=await params;if(!isLegalSlug(slug))return {};
  const doc=legalDocuments[slug];const canonical=`/tr/yasal/${slug}`;const url=`/${locale}/yasal/${slug}`;
  return {title:`${doc.title} | ARZ Mimarlık`,description:doc.description,robots:{index:true,follow:true},alternates:{canonical,languages:Object.fromEntries(locales.map(l=>[l,`/${l}/yasal/${slug}`]))},openGraph:{type:"article",locale:"tr_TR",url,title:`${doc.title} | ARZ Mimarlık`,description:doc.description,siteName:companyLegalConfig.brandName}};
}
export default async function Page({params}:Props){const{locale,slug}=await params;if(!locales.includes(locale as (typeof locales)[number])||!isLegalSlug(slug))notFound();return <LegalPage locale={locale} document={legalDocuments[slug]}/>;}
