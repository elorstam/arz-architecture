"use client";

import {useEffect, useState} from "react";

import MediaPicker from "@/components/admin/MediaPicker";
import type {ProjectSeo} from "@/lib/ai-project";
import type {ManagedPost, PostTranslation} from "@/types/cms";

const languages = ["tr", "en", "de", "fr", "es", "nl", "ar", "ja", "ko", "zh"];
type Term = {id: string; slug: string; translations: Record<string, string>};
type Terms = {categories: Term[]; tags: Term[]};

async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    let message = "İstek başarısız oldu.";
    if (text) {
      try {
        const json = JSON.parse(text) as {error?: string; message?: string};
        message = json.error ?? json.message ?? message;
      } catch {
        message = response.status >= 500
          ? "Sunucu isteği tamamlayamadı."
          : text.slice(0, 300);
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

const blankTranslation = (): PostTranslation => ({title: "", excerpt: "", content: ""});
const blankSeo = (): ProjectSeo => ({
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  openGraphDescription: "",
});
const blank = (): ManagedPost => ({
  id: crypto.randomUUID(),
  status: "draft",
  author: "ARZ Mimarlık",
  coverUrl: "",
  categoryId: null,
  tagIds: [],
  publishAt: null,
  translations: {tr: blankTranslation()},
  seo: {tr: blankSeo()},
  slugs: {tr: ""},
});

export default function BlogAdmin() {
  const [items, setItems] = useState<ManagedPost[]>([]);
  const [terms, setTerms] = useState<Terms>({categories: [], tags: []});
  const [post, setPost] = useState<ManagedPost | null>(null);
  const [language, setLanguage] = useState("tr");
  const [status, setStatus] = useState("");

  async function load() {
    try {
      const [posts, taxonomy] = await Promise.all([
        fetch("/api/admin/posts").then(parseApiResponse<ManagedPost[]>),
        fetch("/api/admin/post-taxonomies").then(parseApiResponse<Terms>),
      ]);
      setItems(posts ?? []);
      setTerms(taxonomy ?? {categories: [], tags: []});
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Blog verileri yüklenemedi.");
    }
  }

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, []);

  const translation = post?.translations[language] || blankTranslation();
  const seo = post?.seo[language] || blankSeo();
  const update = (patch: Partial<ManagedPost>) =>
    setPost((current) => (current ? {...current, ...patch} : current));

  async function save() {
    if (!post) return;
    setStatus("Kaydediliyor…");
    try {
      await parseApiResponse<ManagedPost>(
        await fetch("/api/admin/posts", {
          method: "POST",
          headers: {"content-type": "application/json"},
          body: JSON.stringify(post),
        }),
      );
      setStatus("Kaydedildi.");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Blog yazısı kaydedilemedi.");
    }
  }

  async function remove() {
    if (!post || !window.confirm("Bu blog yazısını silmek istediğinizden emin misiniz?")) return;
    setStatus("Siliniyor…");
    try {
      await parseApiResponse<{success: true}>(
        await fetch("/api/admin/posts", {
          method: "DELETE",
          headers: {"content-type": "application/json"},
          body: JSON.stringify({id: post.id}),
        }),
      );
      setPost(null);
      setStatus("Blog yazısı silindi.");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Blog yazısı silinemedi.");
    }
  }

  async function generate() {
    if (!post) return;
    setStatus("Türkçe blog taslağı ve SEO hazırlanıyor…");
    try {
      const generated = await parseApiResponse<{
        title: string;
        excerpt: string;
        content: string;
        slug: string;
        seo: ProjectSeo;
      }>(
        await fetch("/api/admin/ai/blog/generate", {
          method: "POST",
          headers: {"content-type": "application/json"},
          body: JSON.stringify({
            title: post.translations.tr?.title,
            notes: post.translations.tr?.content,
          }),
        }),
      );
      let next: ManagedPost = {
        ...post,
        translations: {
          ...post.translations,
          tr: {
            title: generated.title,
            excerpt: generated.excerpt,
            content: generated.content,
          },
        },
        slugs: {...post.slugs, tr: generated.slug},
        seo: {...post.seo, tr: generated.seo},
      };
      setPost(next);
      setStatus("Çeviriler üçerli gruplar halinde hazırlanıyor…");

      for (let index = 1; index < languages.length; index += 3) {
        const group = languages.slice(index, index + 3);
        try {
          const translated = await parseApiResponse<
            Record<string, PostTranslation & {slug: string; seo: ProjectSeo}>
          >(
            await fetch("/api/admin/ai/blog/translate", {
              method: "POST",
              headers: {"content-type": "application/json"},
              body: JSON.stringify({
                source: {
                  ...next.translations.tr,
                  slug: next.slugs.tr,
                  seo: next.seo.tr,
                },
                locales: group,
              }),
            }),
          );
          for (const locale of group) {
            const value = translated[locale];
            if (!value) continue;
            next = {
              ...next,
              translations: {
                ...next.translations,
                [locale]: {
                  title: value.title,
                  excerpt: value.excerpt,
                  content: value.content,
                },
              },
              slugs: {...next.slugs, [locale]: value.slug},
              seo: {...next.seo, [locale]: value.seo},
            };
          }
          setPost(next);
        } catch (error) {
          setStatus(
            `${group.join(", ")} çevirileri tamamlanamadı: ${
              error instanceof Error ? error.message : "İstek başarısız oldu."
            } Başarılı diller korundu.`,
          );
        }
      }
      setStatus("AI taslağı hazır. Kontrol edip Kaydet düğmesine basın.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "AI taslağı oluşturulamadı.");
    }
  }

  if (!post) {
    return (
      <div className="p-6">
        <div className="flex justify-between gap-4">
          <h1 className="text-2xl">Blog</h1>
          <button onClick={() => setPost(blank())} className="bg-white px-4 py-2 text-black">
            Yeni yazı
          </button>
        </div>
        {status && <p className="mt-4 text-amber-100">{status}</p>}
        <div className="mt-6 space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setPost(structuredClone(item))}
              className="block w-full border border-white/10 p-4 text-left"
            >
              {item.translations.tr?.title || "Başlıksız"} · {item.status}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap justify-between gap-3">
        <button onClick={() => setPost(null)}>← Liste</button>
        <div className="flex flex-wrap gap-2">
          <button onClick={remove} className="border border-red-400/50 px-4 py-2 text-red-200">Sil</button>
          <button onClick={generate} className="border border-violet-300 px-4 py-2">✨ AI Oluştur</button>
          <button onClick={save} className="bg-white px-5 py-2 text-black">Kaydet</button>
        </div>
      </div>
      {status && <p className="my-4 text-white/60">{status}</p>}

      <div className="grid gap-4 md:grid-cols-4">
        <label>
          Durum
          <select value={post.status} onChange={(event) => update({status: event.target.value as ManagedPost["status"]})} className="field">
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
            <option value="scheduled">Zamanlanmış</option>
          </select>
        </label>
        <Field label="Yazar" value={post.author} onChange={(value) => update({author: value})} />
        <Field label="Yayın tarihi" value={post.publishAt || ""} onChange={(value) => update({publishAt: value || null})} />
        <div>
          <Field label="Kapak URL" value={post.coverUrl} onChange={(value) => update({coverUrl: value})} />
          <MediaPicker onSelect={(url) => update({coverUrl: url})} />
        </div>
        <label>
          Kategori
          <select className="field" value={post.categoryId || ""} onChange={(event) => update({categoryId: event.target.value || null})}>
            <option value="">Yok</option>
            {terms.categories.map((item) => <option key={item.id} value={item.id}>{item.translations.tr || item.slug}</option>)}
          </select>
        </label>
        <label>
          Etiketler
          <select multiple className="field" value={post.tagIds} onChange={(event) => update({tagIds: Array.from(event.target.selectedOptions, (option) => option.value)})}>
            {terms.tags.map((item) => <option key={item.id} value={item.id}>{item.translations.tr || item.slug}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap">
        {languages.map((locale) => (
          <button key={locale} onClick={() => setLanguage(locale)} className={`px-3 py-2 ${locale === language ? "bg-white text-black" : "border border-white/10"}`}>
            {locale}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-4">
        <Field label="Başlık" value={translation.title} onChange={(value) => update({translations: {...post.translations, [language]: {...translation, title: value}}})} />
        <Field label="Slug" value={post.slugs[language] || ""} onChange={(value) => update({slugs: {...post.slugs, [language]: value}})} />
        <Field label="Özet" area value={translation.excerpt} onChange={(value) => update({translations: {...post.translations, [language]: {...translation, excerpt: value}}})} />
        <Field label="İçerik (HTML)" area value={translation.content} onChange={(value) => update({translations: {...post.translations, [language]: {...translation, content: value}}})} />
        <Field label="SEO başlık" value={seo.metaTitle} onChange={(value) => update({seo: {...post.seo, [language]: {...seo, metaTitle: value}}})} />
        <Field label="SEO açıklama" area value={seo.metaDescription} onChange={(value) => update({seo: {...post.seo, [language]: {...seo, metaDescription: value}}})} />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  area = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  area?: boolean;
}) {
  return (
    <label className="block text-xs text-white/60">
      {label}
      {area ? (
        <textarea className="field" rows={6} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className="field" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
