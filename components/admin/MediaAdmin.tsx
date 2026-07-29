"use client";

import Image from "next/image";
import {useEffect, useState} from "react";

import type {MediaItem} from "@/types/cms";

const translationLocales = ["en", "de", "fr", "es", "nl", "ar", "ja", "ko", "zh"];

async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    let message = "İstek başarısız oldu.";
    if (text) {
      try {
        const json = JSON.parse(text) as {error?: string; message?: string};
        message = json.error ?? json.message ?? message;
      } catch {
        message = response.status >= 500 ? "Sunucu isteği tamamlayamadı." : text.slice(0, 300);
      }
    }
    throw new Error(message);
  }
  if (!text) return null as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Sunucu geçerli bir JSON yanıtı döndürmedi.");
  }
}

export default function MediaAdmin() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const media = await parseApiResponse<MediaItem[]>(await fetch("/api/admin/media"));
      setItems(media ?? []);
      setStatus("");
    } catch {
      setItems([]);
      setStatus("Medya verileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function upload(file: File) {
    const form = new FormData();
    form.append("file", file);
    setStatus("Yükleniyor…");
    try {
      await parseApiResponse<MediaItem>(
        await fetch("/api/admin/media", {method: "POST", body: form}),
      );
      setStatus("Görsel yüklendi.");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Görsel yüklenemedi.");
    }
  }

  async function generateAltText(item: MediaItem) {
    setStatus("AI Türkçe alt metin hazırlıyor…");
    try {
      const generated = await parseApiResponse<{alt: string}>(
        await fetch("/api/admin/ai/alt-text", {
          method: "POST",
          headers: {"content-type": "application/json"},
          body: JSON.stringify({url: item.url}),
        }),
      );
      let nextAltTexts = {...item.altTexts, tr: generated.alt};
      setItems((current) =>
        current.map((value) =>
          value.id === item.id ? {...value, altTexts: nextAltTexts} : value,
        ),
      );
      setStatus("Alt metin çevirileri hazırlanıyor…");

      for (let index = 0; index < translationLocales.length; index += 3) {
        const group = translationLocales.slice(index, index + 3);
        try {
          const data = await parseApiResponse<Record<string, {alt: string}>>(
            await fetch("/api/admin/ai/site-translations", {
              method: "POST",
              headers: {"content-type": "application/json"},
              body: JSON.stringify({source: {alt: generated.alt}, locales: group}),
            }),
          );
          const translated = Object.fromEntries(
            group
              .filter((locale) => data[locale]?.alt)
              .map((locale) => [locale, data[locale].alt]),
          );
          nextAltTexts = {...nextAltTexts, ...translated};
          setItems((current) =>
            current.map((value) =>
              value.id === item.id ? {...value, altTexts: nextAltTexts} : value,
            ),
          );
        } catch {
          setStatus(`${group.join(", ")} alt metin çevirileri tamamlanamadı. Başarılı diller korundu.`);
        }
      }
      setStatus("Alt metin taslağı hazır; kaydetmeyi unutmayın.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "AI alt metin oluşturulamadı.");
    }
  }

  async function save(item: MediaItem) {
    setStatus("Kaydediliyor…");
    try {
      await parseApiResponse<MediaItem>(
        await fetch("/api/admin/media", {
          method: "PATCH",
          headers: {"content-type": "application/json"},
          body: JSON.stringify(item),
        }),
      );
      setStatus("Kaydedildi.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Medya bilgileri kaydedilemedi.");
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm("Bu görsel proje veya blogda kullanılıyor olabilir. Yine de silinsin mi?")) return;
    setStatus("Siliniyor…");
    try {
      await parseApiResponse<{success: true}>(
        await fetch("/api/admin/media", {
          method: "DELETE",
          headers: {"content-type": "application/json"},
          body: JSON.stringify({id: item.id, confirmed: true}),
        }),
      );
      setStatus("Görsel silindi.");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Görsel silinemedi.");
    }
  }

  const visibleItems = items.filter((item) =>
    item.filename.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="text-2xl">Medya Kütüphanesi</h1>
        <label className="cursor-pointer bg-white px-4 py-2 text-black">
          Görsel yükle
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
      <input
        placeholder="Dosya ara"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="field mt-4 max-w-md"
      />
      {status && <p className="my-4 text-white/60">{status}</p>}
      {loading ? (
        <p className="mt-8 text-white/45">Medya yükleniyor…</p>
      ) : visibleItems.length === 0 ? (
        <div className="mt-8 border border-white/10 p-8 text-white/45">
          Medya kütüphanesinde henüz görsel bulunmuyor.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {visibleItems.map((item) => (
            <div key={item.id} className="border border-white/10 p-3">
              <div className="relative aspect-video">
                <Image src={item.url} alt={item.altTexts.tr || ""} fill unoptimized className="object-cover" />
              </div>
              <p className="mt-2 truncate text-xs">
                {item.filename} · {(item.sizeBytes / 1024).toFixed(0)} KB
              </p>
              <textarea
                value={item.altTexts.tr || ""}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((value) =>
                      value.id === item.id
                        ? {...value, altTexts: {...value.altTexts, tr: event.target.value}}
                        : value,
                    ),
                  )
                }
                className="field"
                placeholder="Türkçe alt metin"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => generateAltText(item)} className="border px-2 py-1 text-xs">AI Alt Metin</button>
                <button onClick={() => save(item)} className="border px-2 py-1 text-xs">Kaydet</button>
                <button onClick={() => remove(item)} className="text-xs text-red-300">Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
