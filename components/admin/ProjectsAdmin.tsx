'use client';

import Image from 'next/image';
import {useEffect, useState} from 'react';
import type {Project} from '@/data/projects';
import type {ProjectSeo, SupportedLocale, TranslationLocale} from '@/lib/ai-project';
import MediaPicker from '@/components/admin/MediaPicker';

type Managed = {
  id: string;
  slugTr: string;
  slugEn: string;
  published: boolean;
  order: number;
  tr: Project;
  en: Project;
  translations?: Record<string, Project>;
  seo?: Record<string, ProjectSeo>;
};

const locales: Array<{code: SupportedLocale; label: string}> = [
  {code: 'tr', label: 'Türkçe'}, {code: 'en', label: 'English'},
  {code: 'de', label: 'Deutsch'}, {code: 'fr', label: 'Français'},
  {code: 'es', label: 'Español'}, {code: 'nl', label: 'Nederlands'},
  {code: 'ar', label: 'العربية'}, {code: 'ja', label: '日本語'},
  {code: 'ko', label: '한국어'}, {code: 'zh', label: '中文'},
];
const blankProject = (): Project => ({
  slug: '', title: '', titleLines: [''], category: '', location: '',
  year: new Date().getFullYear().toString(), services: [], cover: '',
  coverAlt: '', description: '', detailParagraphs: [], images: [],
});
const blankManaged = (): Managed => {
  const tr = blankProject();
  const en = blankProject();
  return {id: crypto.randomUUID(), slugTr: '', slugEn: '', published: true, order: 999, tr, en, translations: {tr, en}, seo: {}};
};
const slugify = (value: string) => value.toLocaleLowerCase('tr').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/ş/g, 's')
  .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function AdminDashboard() {
  const [items, setItems] = useState<Managed[]>([]);
  const [selected, setSelected] = useState<Managed | null>(null);
  const [locale, setLocale] = useState<SupportedLocale>('tr');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiPhase, setAiPhase] = useState<'idle' | 'content' | 'translations' | 'complete'>('idle');
  const [failedLocales, setFailedLocales] = useState<TranslationLocale[]>([]);

  async function load() {
    setLoading(true);
    const response = await fetch('/api/admin/projects');
    if (response.ok) setItems(await response.json());
    setLoading(false);
  }
  // Initial data loading intentionally synchronizes the client dashboard with the admin API.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {void load();}, []);

  const project = selected
    ? (selected.translations?.[locale] ?? (locale === 'tr' ? selected.tr : selected.en))
    : null;
  const seo = selected?.seo?.[locale];

  function updateRoot<K extends keyof Managed>(key: K, value: Managed[K]) {
    setSelected((current) => current ? {...current, [key]: value} : current);
  }
  function updateProject<K extends keyof Project>(key: K, value: Project[K]) {
    setSelected((current) => {
      if (!current) return current;
      const existing = current.translations?.[locale] ?? (locale === 'tr' ? current.tr : current.en);
      const next = {...existing, [key]: value};
      return {
        ...current,
        tr: locale === 'tr' ? next : current.tr,
        en: locale === 'en' ? next : current.en,
        translations: {...current.translations, [locale]: next},
      };
    });
  }
  function updateSeo(key: keyof ProjectSeo, value: string | string[]) {
    if (!selected) return;
    const current = selected.seo?.[locale] ?? {metaTitle: '', metaDescription: '', keywords: [], openGraphDescription: ''};
    updateRoot('seo', {...selected.seo, [locale]: {...current, [key]: value}});
  }

  async function translateInGroups(base: Managed, localesToTranslate: TranslationLocale[]) {
    let working = base;
    const failed: TranslationLocale[] = [];
    for (let index = 0; index < localesToTranslate.length; index += 3) {
      const group = localesToTranslate.slice(index, index + 3);
      setStatus(`Çeviriler hazırlanıyor (${index + 1}-${Math.min(index + group.length, localesToTranslate.length)} / ${localesToTranslate.length})…`);
      try {
        const response = await fetch('/api/admin/ai/translate', {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({project: working.tr, seo: working.seo?.tr, locales: group}),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `${group.join(', ')} çevirileri oluşturulamadı.`);
        working = {
          ...working,
          en: result.translations.en ?? working.en,
          translations: {...working.translations, ...result.translations},
          seo: {...working.seo, ...result.seo},
        };
        setSelected(working);
      } catch {
        failed.push(...group);
      }
    }
    setFailedLocales(failed);
    setAiPhase('complete');
    if (failed.length) {
      setStatus(`Türkçe içerik hazır. Şu diller tamamlanamadı: ${failed.join(', ')}. Yalnızca başarısız dilleri yeniden deneyebilirsiniz.`);
    } else {
      setStatus('Tamamlandı. AI taslağını kontrol edip Kaydet düğmesine basın.');
    }
    return working;
  }

  async function generateWithAi() {
    if (!selected || !selected.tr.title.trim()) {
      setStatus('AI üretimi için önce Türkçe proje başlığını girin.');
      return;
    }
    setFailedLocales([]);
    setAiPhase('content');
    setStatus('Türkçe içerik ve SEO hazırlanıyor…');
    try {
      const response = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({project: selected.tr}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'AI üretimi başarısız.');
      const withTurkishContent: Managed = {
        ...selected,
        slugTr: result.slugTr,
        slugEn: result.slugEn,
        tr: result.project,
        translations: {...selected.translations, tr: result.project},
        seo: {...selected.seo, tr: result.seo},
      };
      setSelected(withTurkishContent);
      setAiPhase('translations');
      setStatus('Çeviriler hazırlanıyor…');
      await translateInGroups(withTurkishContent, ['en', 'de', 'fr', 'es', 'nl', 'ar', 'ja', 'ko', 'zh']);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'AI üretimi başarısız.');
      setAiPhase('idle');
    }
  }

  async function retryFailedTranslations() {
    if (!selected || !failedLocales.length || !selected.seo?.tr) return;
    const retryLocales = [...failedLocales];
    setFailedLocales([]);
    setAiPhase('translations');
    setStatus('Başarısız çeviriler yeniden hazırlanıyor…');
    await translateInGroups(selected, retryLocales);
  }

  async function save() {
    if (!selected) return;
    const slugTr = selected.slugTr || slugify(selected.tr.title);
    const slugEn = selected.slugEn || slugify(selected.en.title || selected.tr.title);
    const payload = {...selected, slugTr, slugEn};
    setStatus('Kaydediliyor…');
    const response = await fetch('/api/admin/projects', {
      method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(payload),
    });
    setStatus(response.ok ? 'Kaydedildi.' : 'Kaydetme hatası.');
    if (response.ok) {setSelected(payload); await load();}
  }
  async function remove() {
    if (!selected || !confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    await fetch('/api/admin/projects', {method: 'DELETE', headers: {'content-type': 'application/json'}, body: JSON.stringify({id: selected.id})});
    setSelected(null);
    await load();
  }
  async function upload(file: File, kind: 'cover' | 'gallery') {
    if (!selected || !project) return;
    setStatus('Görsel yükleniyor…');
    const form = new FormData();
    form.append('file', file);
    form.append('slug', selected.slugTr || slugify(selected.tr.title) || 'project');
    const response = await fetch('/api/admin/upload', {method: 'POST', body: form});
    const result = await response.json();
    if (!response.ok) {setStatus(result.error || 'Yükleme hatası.'); return;}
    if (kind === 'cover') updateProject('cover', result.url);
    else updateProject('images', [...project.images, {src: result.url, alt: project.title || 'Proje görseli'}]);
    setStatus('Görsel yüklendi.');
  }
  async function logout() {
    await fetch('/api/admin/logout', {method: 'POST'});
    location.reload();
  }
  async function downloadBackup() {
    setStatus('Yedek hazırlanıyor…');
    const response = await fetch('/api/admin/backup');
    if (!response.ok) {setStatus('Yedek alınamadı.'); return;}
    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ARZ-Backup-${new Date().toISOString().slice(0, 10)}.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('Yedek indirildi.');
  }
  async function restoreBackup(file: File) {
    if (!confirm('Bu yedek mevcut proje verilerini ve yüklenen görselleri değiştirecek. Devam edilsin mi?')) return;
    setStatus('Yedek geri yükleniyor…');
    const form = new FormData();
    form.append('file', file);
    const response = await fetch('/api/admin/backup', {method: 'POST', body: form});
    const result = await response.json();
    if (!response.ok) {setStatus(result.error || 'Yedek geri yüklenemedi.'); return;}
    setSelected(null);
    await load();
    setStatus(`Yedek geri yüklendi: ${result.projects ?? 0} proje, ${result.images ?? 0} görsel.`);
  }

  return <div className="min-h-screen lg:grid lg:grid-cols-[300px_1fr]">
    <aside className="border-r border-white/10 bg-black/40 p-5 lg:min-h-screen">
      <div className="flex items-center justify-between">
        <div><p className="text-[9px] uppercase tracking-[.35em] text-white/35">ARZ Mimarlık</p><h1 className="mt-2 text-2xl font-light">Projeler</h1></div>
        <button onClick={logout} className="text-xs text-white/45 hover:text-white">Çıkış</button>
      </div>
      <button onClick={() => {setSelected(blankManaged()); setLocale('tr');}} className="mt-8 w-full border border-white/20 px-4 py-3 text-sm hover:bg-white hover:text-black">+ Yeni proje</button>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={downloadBackup} className="border border-white/15 px-3 py-2 text-xs text-white/70 hover:bg-white/10">Yedek indir</button>
        <label className="cursor-pointer border border-white/15 px-3 py-2 text-center text-xs text-white/70 hover:bg-white/10">Yedek yükle<input type="file" accept=".zip,application/zip" hidden onChange={(event) => {const file = event.target.files?.[0]; if (file) void restoreBackup(file); event.currentTarget.value = '';}}/></label>
      </div>
      <div className="mt-6 space-y-1">
        {loading ? <p className="text-sm text-white/35">Yükleniyor…</p> : items.map((item) =>
          <button key={item.id} onClick={() => {setSelected(structuredClone(item)); setLocale('tr');}} className={`w-full border-l px-4 py-3 text-left ${selected?.id === item.id ? 'border-white bg-white/10' : 'border-white/10 hover:bg-white/5'}`}>
            <span className="block text-sm">{item.tr.title}</span>
            <span className="mt-1 block text-[10px] text-white/35">{item.tr.location} · {item.tr.year}</span>
          </button>)}
      </div>
    </aside>
    <section className="p-5 md:p-10">
      {!selected || !project ? <div className="flex min-h-[60vh] items-center justify-center text-white/35">Bir proje seçin veya yeni proje oluşturun.</div> :
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div><p className="text-[9px] uppercase tracking-[.35em] text-white/35">Proje düzenleyici</p><h2 className="mt-2 text-3xl font-light">{selected.tr.title || 'Yeni proje'}</h2></div>
            <div className="flex flex-wrap gap-2">
              <button onClick={generateWithAi} disabled={aiPhase === 'content' || aiPhase === 'translations'} className="border border-violet-300/50 bg-violet-400/10 px-5 py-2 text-sm text-violet-100 disabled:opacity-50">
                {aiPhase === 'content' ? '1/3 Türkçe içerik ve SEO hazırlanıyor…' : aiPhase === 'translations' ? '2/3 Çeviriler hazırlanıyor…' : aiPhase === 'complete' && !failedLocales.length ? '3/3 Tamamlandı' : '✨ AI Oluştur'}
              </button>
              {failedLocales.length > 0 && <button onClick={retryFailedTranslations} className="border border-amber-300/50 px-4 py-2 text-sm text-amber-100">Başarısız dilleri yeniden dene ({failedLocales.join(', ')})</button>}
              <button onClick={remove} className="border border-red-400/30 px-4 py-2 text-sm text-red-300">Sil</button>
              <button onClick={save} className="bg-white px-5 py-2 text-sm text-black">Kaydet</button>
            </div>
          </div>
          {status && <p className="mt-4 text-sm text-white/60">{status}</p>}
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Field label="Sıra" value={String(selected.order)} onChange={(value) => updateRoot('order', Number(value))}/>
            <Field label="Türkçe slug" value={selected.slugTr} onChange={(value) => updateRoot('slugTr', slugify(value))}/>
            <Field label="İngilizce slug" value={selected.slugEn} onChange={(value) => updateRoot('slugEn', slugify(value))}/>
          </div>
          <label className="mt-5 flex items-center gap-3 text-sm"><input type="checkbox" checked={selected.published} onChange={(event) => updateRoot('published', event.target.checked)}/> Yayında</label>
          <div className="mt-10 flex flex-wrap border-b border-white/10">
            {locales.map((item) => <button key={item.code} onClick={() => setLocale(item.code)} className={`px-4 py-3 text-xs ${locale === item.code ? 'border-b border-white text-white' : 'text-white/40'}`}>{item.label}</button>)}
          </div>
          <div className="mt-8 space-y-7">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Başlık" value={project.title} onChange={(value) => updateProject('title', value)}/>
              <Field label="Başlık satırları" value={project.titleLines.join('\n')} area onChange={(value) => updateProject('titleLines', value.split('\n'))}/>
              <Field label="Kategori" value={project.category} onChange={(value) => updateProject('category', value)}/>
              <Field label="Konum" value={project.location} onChange={(value) => updateProject('location', value)}/>
              <Field label="Yıl" value={project.year} onChange={(value) => updateProject('year', value)}/>
              <Field label="Hizmetler (her satır ayrı)" value={project.services.join('\n')} area onChange={(value) => updateProject('services', value.split('\n'))}/>
            </div>
            <Field label="Kısa açıklama" value={project.description} area onChange={(value) => updateProject('description', value)}/>
            <Field label="Detay paragrafları (her satır ayrı)" value={project.detailParagraphs.join('\n')} area onChange={(value) => updateProject('detailParagraphs', value.split('\n'))}/>
            <div className="border border-violet-300/20 bg-violet-400/5 p-5">
              <h3 className="text-lg">SEO</h3>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field label="Meta başlık" value={seo?.metaTitle ?? ''} onChange={(value) => updateSeo('metaTitle', value)}/>
                <Field label="Anahtar kelimeler (virgülle ayırın)" value={seo?.keywords.join(', ') ?? ''} onChange={(value) => updateSeo('keywords', value.split(',').map((word) => word.trim()).filter(Boolean))}/>
              </div>
              <div className="mt-5 space-y-5">
                <Field label="Meta açıklama" value={seo?.metaDescription ?? ''} area onChange={(value) => updateSeo('metaDescription', value)}/>
                <Field label="Open Graph açıklaması" value={seo?.openGraphDescription ?? ''} area onChange={(value) => updateSeo('openGraphDescription', value)}/>
              </div>
            </div>
            <div className="border border-white/10 p-5">
              <h3 className="text-lg">Kapak görseli</h3>
              {project.cover && <div className="relative mt-4 aspect-[16/9] max-w-xl overflow-hidden bg-white/5"><Image src={project.cover} alt={project.coverAlt} fill className="object-cover" unoptimized/></div>}
              <div className="mt-4 flex flex-wrap gap-3">
                <label className="cursor-pointer border border-white/20 px-4 py-2 text-sm">Görsel yükle<input type="file" accept="image/*" hidden onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], 'cover')}/></label>
                <input value={project.cover} onChange={(event) => updateProject('cover', event.target.value)} placeholder="veya /images/... yolu" className="min-w-[280px] flex-1 border border-white/15 bg-transparent px-3 py-2 text-sm"/>
                <MediaPicker onSelect={(url) => updateProject('cover', url)}/>
              </div>
              <Field label="Kapak alt metni" value={project.coverAlt} onChange={(value) => updateProject('coverAlt', value)}/>
            </div>
            <div className="border border-white/10 p-5">
              <div className="flex items-center justify-between"><h3 className="text-lg">Galeri</h3><label className="cursor-pointer border border-white/20 px-4 py-2 text-sm">Görsel ekle<input type="file" accept="image/*" hidden onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], 'gallery')}/></label></div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{project.images.map((image, index) =>
                <div key={`${image.src}-${index}`} className="border border-white/10 p-3">
                  <div className="relative aspect-[4/3] overflow-hidden bg-white/5"><Image src={image.src} alt={image.alt} fill className="object-cover" unoptimized/></div>
                  <input value={image.alt} onChange={(event) => {const images = [...project.images]; images[index] = {...images[index], alt: event.target.value}; updateProject('images', images);}} className="mt-3 w-full border border-white/10 bg-transparent px-2 py-2 text-xs"/>
                  <button onClick={() => updateProject('images', project.images.filter((_, itemIndex) => itemIndex !== index))} className="mt-2 text-xs text-red-300">Kaldır</button>
                </div>)}</div>
            </div>
          </div>
        </div>}
    </section>
  </div>;
}

function Field({label, value, onChange, area = false}: {label: string; value: string; onChange: (value: string) => void; area?: boolean}) {
  return <label className="block text-xs text-white/50">{label}{area
    ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="field resize-y"/>
    : <input value={value} onChange={(event) => onChange(event.target.value)} className="field"/>}</label>;
}
