import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const css=readFileSync("app/globals.css","utf8");
const tokens=readFileSync("components/studio/ui/studio-tokens.ts","utf8");
const surface=readFileSync("components/studio/ui/StudioIconSurface.tsx","utf8");
const primitives=readFileSync("components/studio/ui/StudioUiPrimitives.tsx","utf8");
const designSystem=readFileSync("components/studio/StudioDesignSystem.tsx","utf8");
const dashboardSurface=readFileSync("components/studio/dashboard/StudioDashboardIconSurface.tsx","utf8");

test("Studio workspace and surfaces use the neutral global palette",()=>{
 assert.match(tokens,/workspace:"#F7F9FC"/);
 assert.match(tokens,/surface:"#FFFFFF"/);
 assert.match(css,/--studio-bg: #f7f9fc/);
 assert.match(css,/--studio-workspace: #f7f9fc/);
 assert.match(css,/\.studio-button--secondary \{[^}]*border-color:var\(--studio-border\)[^}]*background:var\(--studio-surface\)/);
 assert.match(css,/\.studio-button--secondary:hover \{[^}]*background:var\(--studio-surface-muted\)/);
});

test("shared icon surfaces expose only the approved tone language",()=>{
 assert.match(surface,/StudioIconTone="blue"\|"green"\|"purple"\|"orange"\|"slate"\|"red"/);
 assert.doesNotMatch(surface,/"gold"|"amber"|"sand"/);
 for(const tone of ["blue","green","purple","orange","slate","red"])assert.match(css,new RegExp(`studio-icon-surface--${tone}`));
 assert.doesNotMatch(css,/studio-icon-surface--(?:gold|amber|sand)/);
 assert.match(dashboardSurface,/return <StudioIconSurface/);
});

test("headers sections and empty states route icons through StudioIconSurface",()=>{
 assert.match(primitives,/StudioPageHeader[\s\S]*StudioIconSurface icon=\{icon\} tone="blue" size="sm"/);
 assert.match(primitives,/StudioSectionHeader[\s\S]*StudioIconSurface icon=\{icon\} tone="blue" size="sm"/);
 assert.match(designSystem,/StudioEmptyState[\s\S]*StudioIconSurface icon=\{icon\} tone="slate" size="lg"/);
});

test("retired warm design-system colors cannot return",()=>{
 const shared=`${tokens}\n${surface}\n${primitives}\n${designSystem}`;
 assert.doesNotMatch(shared,/#F6EBD7|#F8F1E5|#F5EAD5|#F7E7C6|cream|beige/i);
 assert.doesNotMatch(css,/#f7f1e6|#f1e7d5|#f1ece2|#f5f2ec|#eee9df|#fbf3e4|#f6f2e8/i);
});
