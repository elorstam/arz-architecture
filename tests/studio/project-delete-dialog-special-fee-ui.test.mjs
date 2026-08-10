import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import test from "node:test";

const dialog = readFileSync("components/studio/projects/ProjectPermanentDeleteDialog.tsx", "utf8");
const projectPage = readFileSync("app/studio/(protected)/projects/[projectId]/page.tsx", "utf8");
const feesPage = readFileSync("app/studio/(protected)/projects/[projectId]/official-processes/page.tsx", "utf8");
const globals = readFileSync("app/globals.css", "utf8");

test("project page bypasses the old generic delete implementation", () => {
  assert.match(projectPage, /ProjectPermanentDeleteDialog/);
  assert.doesNotMatch(projectPage, /StudioPermanentDeleteDialog/);
  assert.match(dialog, /const \[deleteOpen, setDeleteOpen\] = useState\(false\)/);
  assert.equal(dialog.match(/setDeleteOpen\(true\)/g)?.length, 1);
  assert.equal(dialog.match(/setDeleteOpen\(false\)/g)?.length, 1);
  assert.match(dialog, /createPortal\(/);
  assert.match(dialog, /document\.body/);
  assert.equal(existsSync("components/studio/projects/StudioPermanentDeleteDialog.tsx"), false);
});

test("delete dialog opens only by click and closes only through explicit stable paths", () => {
  assert.match(dialog, /onClick=\{\(\) => setDeleteOpen\(true\)\}/);
  assert.match(dialog, /project-permanent-delete-overlay" onClick=\{closeDialog\}/);
  assert.match(dialog, /event\.key === "Escape"/);
  assert.match(dialog, /window\.addEventListener\("keydown", onKeyDown\)/);
  assert.match(dialog, /window\.removeEventListener\("keydown", onKeyDown\)/);
  assert.doesNotMatch(dialog, /onMouse|onPointer|onFocus|onBlur|onScroll|onResize/);
});

test("confirmation and existing deletion backend remain guarded", () => {
  assert.match(dialog, /confirmation\.trim\(\)\.toLocaleLowerCase\("tr-TR"\)/);
  assert.match(dialog, /disabled=\{!confirmationMatches \|\| pending\}/);
  assert.match(dialog, /preparePermanentProjectDeletionAction\(projectId, projectName\)/);
  assert.match(dialog, /permanentlyDeleteProjectAction\(projectId, deletionToken, reason\)/);
  assert.match(dialog, /if \(!deletionToken \|\| pending\) return/);
});

test("dedicated overlay and dialog are fixed and motionless", () => {
  assert.match(globals, /project-permanent-delete-layer[^}]*position:fixed[^}]*inset:0[^}]*align-items:center[^}]*justify-content:center/);
  assert.match(globals, /project-permanent-delete-overlay[^}]*position:absolute[^}]*background:rgba\(17,25,35,\.46\)/);
  assert.match(globals, /project-permanent-delete-overlay[^}]*backdrop-filter:none[^}]*animation:none[^}]*transition:none/);
  assert.match(globals, /project-permanent-delete-dialog[^}]*position:relative[^}]*width:min\(560px,calc\(100vw - 32px\)\)[^}]*max-height:min\(720px,calc\(100dvh - 48px\)\)/);
  assert.match(globals, /project-permanent-delete-dialog[^}]*animation:none[^}]*transition:none/);
  assert.match(globals, /project-permanent-delete-content[^}]*overflow-y:auto/);
  assert.match(globals, /project-permanent-delete-footer[^}]*flex-shrink:0/);
  assert.doesNotMatch(dialog, /AnimatePresence|framer-motion|useSearchParams|useRouter/);
});

test("special fee action uses canonical primary geometry in the page header", () => {
  assert.match(feesPage, /studioButtonClass\("primary", "md"\)/);
  assert.match(feesPage, /StudioPageHeader[\s\S]*actions=/);
  assert.match(feesPage, /max-sm:w-full/);
  assert.match(globals, /--studio-action-primary:\s*var\(--studio-sidebar-bg\)/);
  assert.match(globals, /--studio-sidebar-bg:\s*#111923/);
});
