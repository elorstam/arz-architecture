import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const page=readFileSync("app/odeme/[token]/page.tsx","utf8");
const checkout=readFileSync("components/payments/PublicPaymentCheckoutButton.tsx","utf8");
const css=readFileSync("app/odeme/[token]/public-payment.css","utf8");
const layout=readFileSync("app/odeme/[token]/layout.tsx","utf8");

test("public payment uses real ARZ and iyzico assets with isolated premium shell",()=>{
 assert.match(page,/\/arz-logo-final\.png/);
 assert.match(checkout,/\/images\/payments\/iyzico_ile_ode_horizontal_white\.png/);
 assert.doesNotMatch(page,/public-payment-mark|font-family:Georgia|font-family:serif/);
 assert.match(css,/\.public-payment-page\{[^}]*background:#111923/);
 assert.match(css,/\.public-payment-card\{[^}]*width:min\(620px,calc\(100vw - 32px\)\)[^}]*background:#fff/);
});

test("ARZ mark is explicitly visible on the white payment card",()=>{
 assert.match(page,/src="\/arz-logo-final\.png"/);
 assert.match(css,/public-payment-brand img\{[^}]*display:block[^}]*width:36px[^}]*height:30px[^}]*opacity:1[^}]*visibility:visible[^}]*filter:brightness\(0\) saturate\(100%\)/);
 assert.doesNotMatch(page,/public-payment-mark/);
});

test("public payment typography and branded CTA contract is readable and responsive",()=>{
 assert.match(layout,/localFont/);
 assert.match(layout,/variable:"--font-studio"/);
 assert.match(css,/font-family:var\(--font-studio\),Arial,Helvetica,sans-serif/);
 assert.match(css,/public-payment-eyebrow\{[^}]*font-weight:650[^}]*letter-spacing:\.1em/);
 assert.match(css,/public-payment-heading h1\{[^}]*font-weight:700[^}]*letter-spacing:-\.035em[^}]*line-height:1\.15/);
 assert.match(css,/public-payment-eyebrow\{[^}]*font-size:12px/);
 assert.match(css,/public-payment-details dt\{[^}]*font-size:13px/);
 assert.match(css,/public-payment-details dd\{[^}]*font-size:14px/);
 assert.match(css,/public-payment-amount\{font-size:18px/);
 assert.match(css,/public-payment-secure\{[^}]*font-size:13px/);
 assert.match(css,/public-payment-iyzico-button\{[^}]*min-height:54px[^}]*border-radius:999px[^}]*background:#111/);
 assert.match(css,/max-width:639px/);
 assert.match(css,/width:calc\(100vw - 24px\)/);
 assert.match(checkout,/if\(pending\)return/);
 assert.match(checkout,/body:"\{\}"/);
});

test("payment states and authoritative checkout contract remain intact",()=>{
 assert.match(page,/resolvePublicPayment\(token,true\)/);
 assert.match(page,/linkStatus==="paid"/);
 assert.match(page,/payment\.status!=="pending"/);
 assert.match(page,/new Date\(resolved\.expiresAt\)/);
 assert.match(checkout,/\/api\/payments\/public\/\$\{encodeURIComponent\(token\)\}\/checkout/);
 assert.match(checkout,/location\.assign\(body\.checkoutUrl\)/);
 assert.doesNotMatch(checkout,/amount|currency|installment|providerPaymentId/);
});
