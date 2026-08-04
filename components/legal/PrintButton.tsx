"use client";
export default function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="rounded-full border border-white/25 px-5 py-3 text-xs uppercase tracking-[.16em] text-white/75 transition hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Yazdır / PDF olarak kaydet</button>;
}
