import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");
const slugs = ["on-bilgilendirme-formu","mesafeli-hizmet-sozlesmesi","iptal-cayma-iade-kosullari","hizmet-teslim-ve-ifa-kosullari","kvkk-aydinlatma-metni","gizlilik-ve-cerez-politikasi","odeme-ve-guvenlik","ticari-bilgiler"];

test("legal route pre-renders every locale and canonical Turkish metadata", async () => {
  const page = await read("app/[locale]/yasal/[slug]/page.tsx");
  assert.match(page, /locales\.flatMap/); assert.match(page, /canonical=`\/tr\/yasal/);
  assert.match(page, /robots:\{index:true,follow:true\}/); assert.match(page, /openGraph/);
});

test("legal documents expose all required routes and review markers", async () => {
  const [content,view] = await Promise.all([read("lib/legal/legal-content.ts"),read("components/legal/LegalPage.tsx")]);
  for (const slug of slugs) assert.match(content, new RegExp(`"${slug}"`));
  assert.match(content, /review\?: boolean/); assert.match(view, /Hukuki inceleme gerekli/); assert.doesNotMatch(content, /hiçbir koşulda iade yoktur/i);
});

test("layout includes accessibility and responsive-print safeguards", async () => {
  const [view,css] = await Promise.all([read("components/legal/LegalPage.tsx"),read("components/legal/LegalPage.module.css")]);
  assert.match(view, /aria-label="İçindekiler"/); assert.match(view, /dateTime=/); assert.match(view, /lang="tr"/);
  assert.match(css, /@media\(min-width:960px\)/); assert.match(css, /@media print/); assert.match(css, /overflow-wrap:anywhere/); assert.match(css, /font-size:1rem/);
});

test("footer and sitemap expose all legal links", async () => {
  const [footer,sitemap] = await Promise.all([read("components/PremiumFooter.tsx"),read("app/sitemap.ts")]);
  for (const slug of slugs) assert.match(footer, new RegExp(slug));
  assert.match(footer, /aria-label="Yasal sayfalar"/); assert.match(sitemap, /legalSlugs/);
});

test("company data has one server-safe source and production-safe placeholders", async () => {
  const config = await read("lib/legal/company-config.ts");
  assert.match(config, /NODE_ENV === "production"/); assert.match(config, /console\.warn/);
  assert.match(config, /NODE_ENV === "development"/); assert.doesNotMatch(config, /\[RESMÎ TİCARİ UNVAN EKLENECEK\]/);
});
