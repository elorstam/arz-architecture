import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read=(path)=>readFile(new URL(`../../${path}`,import.meta.url),"utf8");

test("online payment route has canonical metadata and locale fallback",async()=>{
  const page=await read("app/[locale]/online-odeme/page.tsx");
  assert.match(page,/Güvenli Online Ödeme \| ARZ Mimarlık/);
  assert.match(page,/https:\/\/arzmimarlik\.net\/tr\/online-odeme/);
  assert.match(page,/generateStaticParams/);assert.match(page,/locale!=="tr"/);
  assert.match(page,/robots:\{index:true,follow:true\}/);
});

test("page explains approved-offer collection without checkout",async()=>{
  const page=await read("app/[locale]/online-odeme/page.tsx");
  for(const text of ["standart paket","Teklif müşteri tarafından onaylanır","Kapora","Hakediş","KDV tutarı","Üyelik zorunluluğu olmadan","lisanslı ödeme kuruluşunun","Kart numarası ve CVV"]){assert.match(page,new RegExp(text,"i"));}
  assert.doesNotMatch(page,/Sepete Ekle|Hemen Satın Al|<form|cardNumber|kart numarası.*input/i);
  assert.doesNotMatch(page,/iyzico|PayTR/i);
});

test("page uses central company data and links every required legal document",async()=>{
  const page=await read("app/[locale]/online-odeme/page.tsx");
  assert.match(page,/companyLegalConfig as company/);
  for(const slug of ["iptal-cayma-iade-kosullari","mesafeli-hizmet-sozlesmesi","on-bilgilendirme-formu","hizmet-teslim-ve-ifa-kosullari","odeme-ve-guvenlik","kvkk-aydinlatma-metni"]){assert.match(page,new RegExp(slug));}
});

test("footer and sitemap expose online payment route",async()=>{
  const[footer,sitemap]=await Promise.all([read("components/PremiumFooter.tsx"),read("app/sitemap.ts")]);
  assert.match(footer,/>Online Ödeme</);assert.match(footer,/\$\{locale\}\/online-odeme/);
  assert.match(sitemap,/onlinePaymentPages/);assert.match(sitemap,/\$\{locale\}\/online-odeme/);
});

test("page includes semantic accessibility and responsive overflow safeguards",async()=>{
  const[page,css]=await Promise.all([read("app/[locale]/online-odeme/page.tsx"),read("app/[locale]/online-odeme/OnlinePaymentPage.module.css")]);
  assert.match(page,/aria-labelledby=/);assert.match(page,/aria-label="Ödeme ile ilgili yasal metinler"/);assert.match(page,/<ol/);
  assert.match(css,/@media\(max-width:420px\)/);assert.match(css,/overflow-wrap:anywhere/);assert.match(css,/grid-template-columns:minmax\(0,1\.1fr\)/);
});
