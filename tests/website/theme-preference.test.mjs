import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import vm from "node:vm";

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),"utf8");
const layout=read("app/layout.tsx");
const helper=read("lib/theme-preference.ts");
const toggle=read("components/ThemeToggle.tsx");
const script=layout.match(/const themeScript = `([\s\S]*?)`;/)?.[1];

function runThemeScript({cookie="",stored=null,hostname="portal.arzmimarlik.net",protocol="https:"}={}){
  let writtenCookie="";
  const values=new Map(stored===null?[]:[["arz-theme",stored]]);
  const document={documentElement:{dataset:{},style:{}},get cookie(){return cookie;},set cookie(value){writtenCookie=value;}};
  vm.runInNewContext(script,{document,location:{hostname,protocol},localStorage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)},decodeURIComponent});
  return{theme:document.documentElement.dataset.theme,colorScheme:document.documentElement.style.colorScheme,stored:values.get("arz-theme"),writtenCookie};
}

test("initial theme gives valid cookies precedence over localStorage",()=>{
  assert.equal(runThemeScript({cookie:"arz-theme=light",stored:"dark"}).theme,"light");
  assert.equal(runThemeScript({cookie:"arz-theme=dark",stored:"light"}).theme,"dark");
  assert.equal(runThemeScript({stored:"light"}).theme,"light");
  assert.equal(runThemeScript().theme,"dark");
});

test("initial theme applies color scheme and migrates localStorage to the shared cookie",()=>{
  const result=runThemeScript({stored:"light"});
  assert.equal(result.colorScheme,"light");
  assert.match(result.writtenCookie,/arz-theme=light; Path=\/; Max-Age=31536000; SameSite=Lax; Domain=\.arzmimarlik\.net; Secure/);
  assert.equal(runThemeScript({stored:"dark",hostname:"localhost",protocol:"http:"}).writtenCookie.includes("Domain="),false);
});

test("toggle persists both DOM state and browser preference stores",()=>{
  assert.match(toggle,/document\.documentElement\.dataset\.theme = nextTheme/);
  assert.match(toggle,/document\.documentElement\.style\.colorScheme = nextTheme/);
  assert.match(toggle,/persistThemePreference\(nextTheme\)/);
  assert.match(helper,/localStorage\.setItem\(THEME_KEY, theme\)/);
  assert.match(helper,/writeThemeCookie\(theme\)/);
  assert.match(helper,/Domain=\.arzmimarlik\.net/);
  assert.match(helper,/hostname === "arzmimarlik\.net" \|\| hostname\.endsWith\("\.arzmimarlik\.net"\)/);
});

test("initial script reads cookie before localStorage and defaults to dark",()=>{
  assert.ok(script.indexOf("document.cookie")<script.indexOf("localStorage.getItem"));
  assert.match(script,/valid\(cookieTheme\) \? cookieTheme : valid\(storedTheme\) \? storedTheme : "dark"/);
});
