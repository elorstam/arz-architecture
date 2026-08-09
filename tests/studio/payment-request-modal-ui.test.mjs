import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const primitives=read("components/studio/ui/StudioUiPrimitives.tsx");
const paymentModal=read("components/studio/finance/StudioPaymentRequests.tsx");
const css=read("app/globals.css");

test("Studio modal escapes card clipping through the Studio root portal",()=>{
  assert.match(primitives,/createPortal/);
  assert.match(primitives,/querySelector<HTMLElement>\("\.studio-root"\)/);
  assert.match(primitives,/createPortal\([\s\S]*portalRoot\)/);
  assert.match(css,/\.studio-modal-backdrop \{[^}]*z-index:1000/);
});

test("Studio modal owns viewport overflow and keeps its footer outside the scroll body",()=>{
  assert.match(css,/\.studio-modal \{[^}]*max-height:calc\(100dvh - 3rem\)[^}]*overflow:hidden/);
  assert.match(css,/\.studio-modal__body[^}]*min-height:0; overflow-y:auto; overscroll-behavior:contain/);
  assert.match(css,/\.studio-modal>footer \{[^}]*flex:none/);
  assert.match(css,/@media \(max-width:639px\)[^{]*\{[^}]*\.studio-modal-backdrop \{ padding:\.75rem/);
});

test("payment request actions use the persistent modal footer without changing form submission",()=>{
  assert.match(paymentModal,/footer=\{<>[\s\S]*Vazgeç[\s\S]*type="submit" form=\{paymentFormId\}[\s\S]*Kaydet/);
  assert.match(paymentModal,/<form id=\{paymentFormId\} action=\{async form=>/);
  assert.match(paymentModal,/textarea[^>]*min-h-24/);
});
