"use client";

import { useEffect, useMemo, useState } from "react";

import {
  localeNames,
  translationLocales,
  type AppLocale,
} from "@/i18n/locales";
import type { SiteTranslation } from "@/types/cms";

type TranslationLocale = Exclude<AppLocale, "tr">;
type TranslateMode = "missing" | "selected" | "all";

const TARGET_STORAGE_KEY = "arz-admin-translation-targets";

const defaultTargets = [...translationLocales] as TranslationLocale[];

function hasTranslation(item: SiteTranslation, locale: string) {
  return Boolean(item.translations?.[locale]?.trim());
}

function needsTranslation(item: SiteTranslation, locale: string) {
  return (
    !hasTranslation(item, locale) ||
    item.staleLocales.includes(locale)
  );
}

export default function SiteTranslationsAdmin() {
  const [items, setItems] = useState<SiteTranslation[]>([]);
  const [lang, setLang] = useState<TranslationLocale>("en");
  const [mode, setMode] = useState<TranslateMode>("missing");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [targets, setTargets] =
    useState<TranslationLocale[]>(defaultTargets);

  const load = async () => {
    const response = await fetch("/api/admin/site-translations", {
      cache: "no-store",
    });

    if (!response.ok) {
      setStatus("Çeviriler yüklenemedi.");
      return;
    }

    setItems((await response.json()) as SiteTranslation[]);
  };

  useEffect(() => {
    void load();

    try {
      const saved = window.localStorage.getItem(TARGET_STORAGE_KEY);

      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as string[];
      const valid = parsed.filter((locale) =>
        translationLocales.includes(locale as TranslationLocale),
      ) as TranslationLocale[];

      if (valid.length) {
        setTargets(valid);

        if (!valid.includes(lang)) {
          setLang(valid[0]);
        }
      }
    } catch {
      // Bozuk localStorage kaydı varsa varsayılan dilleri kullan.
    }
  }, []);

  const selectedLanguageName =
    localeNames[lang] || lang.toUpperCase();

  const stats = useMemo(() => {
    const missing = items.reduce((total, item) => {
      return (
        total +
        targets.filter((locale) =>
          needsTranslation(item, locale),
        ).length
      );
    }, 0);

    return {
      keys: items.length,
      missing,
    };
  }, [items, targets]);

  async function save(
    item: SiteTranslation,
    options: { reload?: boolean } = {},
  ) {
    const response = await fetch("/api/admin/site-translations", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `${item.key} kaydedilemedi.`);
    }

    if (options.reload !== false) {
      await load();
    }

    return (await response.json()) as SiteTranslation;
  }

  async function seed() {
    setBusy(true);
    setStatus("Eksik sabit Türkçe metinler seed ediliyor…");

    try {
      const response = await fetch(
        "/api/admin/site-translations",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ seed: true }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setStatus(data.error || "Seed başarısız.");
        return;
      }

      setStatus(
        `${data.created ?? 0} yeni anahtar eklendi, ${
          data.updated ?? 0
        } Türkçe kaynak güncellendi.`,
      );

      await load();
    } finally {
      setBusy(false);
    }
  }

  function getTargetsForRun() {
    if (mode === "selected") {
      return [lang];
    }

    return targets;
  }

  function getSourceForGroup(group: TranslationLocale[]) {
    const selectedItems =
      mode === "missing"
        ? items.filter((item) =>
            group.some((locale) =>
              needsTranslation(item, locale),
            ),
          )
        : items;

    return Object.fromEntries(
      selectedItems
        .filter((item) => item.sourceTr.trim())
        .map((item) => [item.key, item.sourceTr]),
    );
  }

  async function translate() {
    const activeTargets = getTargetsForRun();

    if (!activeTargets.length) {
      setStatus("Önce en az bir AI hedef dili seçin.");
      return;
    }

    setBusy(true);

    let translatedValues = 0;

    try {
      for (let index = 0; index < activeTargets.length; index += 3) {
        const group = activeTargets.slice(
          index,
          index + 3,
        ) as TranslationLocale[];

        const source = getSourceForGroup(group);
        const sourceKeys = Object.keys(source);

        if (!sourceKeys.length) {
          continue;
        }

        setStatus(
          `AI çeviri hazırlanıyor… ${Math.min(
            index + group.length,
            activeTargets.length,
          )}/${activeTargets.length} dil`,
        );

        const response = await fetch(
          "/api/admin/ai/site-translations",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              source,
              locales: group,
            }),
          },
        );

        const data = (await response
          .json()
          .catch(() => ({}))) as Record<
          string,
          Record<string, string>
        > & { error?: string };

        if (!response.ok) {
          throw new Error(
            data.error ||
              `AI çeviri başarısız: ${group.join(", ")}`,
          );
        }

        const changedItems: SiteTranslation[] = [];

        setItems((current) => {
          const next = current.map((item) => {
            if (!(item.key in source)) {
              return item;
            }

            let changed = false;
            const translations = {
              ...item.translations,
            };
            let staleLocales = [...item.staleLocales];

            for (const locale of group) {
              const value = data[locale]?.[item.key]?.trim();

              if (!value) {
                continue;
              }

              const shouldApply =
                mode !== "missing" ||
                needsTranslation(item, locale);

              if (!shouldApply) {
                continue;
              }

              translations[locale] = value;
              staleLocales = staleLocales.filter(
                (entry) => entry !== locale,
              );

              translatedValues += 1;
              changed = true;
            }

            if (!changed) {
              return item;
            }

            const updated: SiteTranslation = {
              ...item,
              translations,
              staleLocales,
            };

            changedItems.push(updated);

            return updated;
          });

          return next;
        });

        /*
         * React state setter senkron bir veri kaynağı olarak kullanılmamalı.
         * Bu yüzden aynı dönüşümü güncel snapshot üzerinde ayrıca hazırlıyoruz.
         */
        const currentSnapshot = items;
        const itemsToSave: SiteTranslation[] = [];

        for (const item of currentSnapshot) {
          if (!(item.key in source)) {
            continue;
          }

          const translations = {
            ...item.translations,
          };
          let staleLocales = [...item.staleLocales];
          let changed = false;

          for (const locale of group) {
            const value = data[locale]?.[item.key]?.trim();

            if (!value) {
              continue;
            }

            const shouldApply =
              mode !== "missing" ||
              needsTranslation(item, locale);

            if (!shouldApply) {
              continue;
            }

            translations[locale] = value;
            staleLocales = staleLocales.filter(
              (entry) => entry !== locale,
            );
            changed = true;
          }

          if (changed) {
            itemsToSave.push({
              ...item,
              translations,
              staleLocales,
            });
          }
        }

        await Promise.all(
          itemsToSave.map((item) =>
            save(item, { reload: false }),
          ),
        );

        /*
         * Her batch sonrası gerçek DB durumunu tekrar alıyoruz.
         * Böylece bir sonraki batch stale/missing durumunu doğru görür.
         */
        const refreshedResponse = await fetch(
          "/api/admin/site-translations",
          { cache: "no-store" },
        );

        if (refreshedResponse.ok) {
          const refreshed =
            (await refreshedResponse.json()) as SiteTranslation[];
          setItems(refreshed);
        }
      }

      await load();

      setStatus(
        translatedValues > 0
          ? `Tamamlandı. ${translatedValues} çeviri otomatik oluşturuldu ve kaydedildi.`
          : "Eksik çeviri bulunamadı.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "AI çeviri tamamlanamadı.",
      );
    } finally {
      setBusy(false);
    }
  }

  function add() {
    const key = window.prompt("Çeviri anahtarı");

    if (!key) {
      return;
    }

    const normalized = key.trim();

    if (
      !normalized ||
      items.some((item) => item.key === normalized)
    ) {
      return;
    }

    setItems((current) => [
      ...current,
      {
        key: normalized,
        sourceTr: "",
        translations: {},
        staleLocales: [...translationLocales],
      },
    ]);
  }

  function toggleTarget(locale: TranslationLocale) {
    setTargets((current) => {
      const next = current.includes(locale)
        ? current.filter((item) => item !== locale)
        : [...current, locale];

      window.localStorage.setItem(
        TARGET_STORAGE_KEY,
        JSON.stringify(next),
      );

      if (
        current.includes(locale) &&
        lang === locale &&
        next.length
      ) {
        setLang(next[0]);
      }

      return next;
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] opacity-50">
            İçerik yönetimi
          </p>
          <h1 className="mt-2 text-2xl font-medium">
            Site Çevirileri
          </h1>
          <p className="mt-2 max-w-2xl text-sm opacity-60">
            Türkçe kaynak metinleri yönetin. Yeni anahtarları seed
            ettikten sonra eksik çevirileri OpenAI ile otomatik
            oluşturup kaydedebilirsiniz.
          </p>
        </div>

        <div className="text-sm opacity-60">
          {stats.keys} anahtar · {stats.missing} eksik / güncel
          olmayan çeviri
        </div>
      </div>

      <div className="rounded-2xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              AI hedef dilleri
            </p>
            <p className="mt-1 text-xs opacity-55">
              Burada kapattığınız dil yalnız AI toplu çeviri
              işlemlerinden çıkarılır. Türkçe kaynak dil olduğu için
              kapatılamaz.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {translationLocales.map((locale) => {
              const active = targets.includes(locale);

              return (
                <button
                  key={locale}
                  type="button"
                  onClick={() =>
                    toggleTarget(locale as TranslationLocale)
                  }
                  className={`rounded-full border px-3 py-2 text-xs transition ${
                    active
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "opacity-45"
                  }`}
                >
                  {localeNames[locale]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={seed}
          disabled={busy}
          className="rounded-xl border px-4 py-3 text-sm disabled:opacity-40"
        >
          Eksik sabit metinleri seed et
        </button>

        <button
          type="button"
          onClick={add}
          disabled={busy}
          className="rounded-xl border px-4 py-3 text-sm disabled:opacity-40"
        >
          Yeni anahtar
        </button>

        <select
          aria-label="Çeviri dili"
          value={lang}
          onChange={(event) =>
            setLang(event.target.value as TranslationLocale)
          }
          className="admin-select w-44"
        >
          {translationLocales.map((locale) => (
            <option key={locale} value={locale}>
              {localeNames[locale]}
            </option>
          ))}
        </select>

        <select
          aria-label="AI çeviri modu"
          value={mode}
          onChange={(event) =>
            setMode(event.target.value as TranslateMode)
          }
          className="admin-select w-64 max-w-full"
        >
          <option value="missing">
            Aktif dillerde sadece eksikleri tamamla
          </option>
          <option value="selected">
            {selectedLanguageName} dilini yeniden çevir
          </option>
          <option value="all">
            Aktif dillerin tamamını yeniden çevir
          </option>
        </select>

        <button
          type="button"
          onClick={translate}
          disabled={busy}
          className="rounded-xl bg-black px-5 py-3 text-sm text-white disabled:opacity-40 dark:bg-white dark:text-black"
        >
          {busy ? "İşleniyor…" : "✨ AI Çeviri"}
        </button>
      </div>

      {status && (
        <div className="rounded-xl border px-4 py-3 text-sm">
          {status}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-xs font-medium opacity-55">
                Anahtar
              </th>
              <th className="px-4 py-3 text-xs font-medium opacity-55">
                Türkçe kaynak
              </th>
              <th className="px-4 py-3 text-xs font-medium opacity-55">
                {selectedLanguageName}
              </th>
              <th className="w-28 px-4 py-3" />
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => {
              const stale = item.staleLocales.includes(lang);

              return (
                <tr
                  key={item.key}
                  className="border-b last:border-b-0"
                >
                  <td className="px-4 py-4 align-top">
                    <code className="text-xs opacity-70">
                      {item.key}
                    </code>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <textarea
                      value={item.sourceTr}
                      onChange={(event) =>
                        setItems((current) =>
                          current.map((entry, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...entry,
                                  sourceTr: event.target.value,
                                }
                              : entry,
                          ),
                        )
                      }
                      className="field min-h-28 w-full"
                    />
                  </td>

                  <td className="px-4 py-4 align-top">
                    <textarea
                      value={item.translations[lang] || ""}
                      onChange={(event) =>
                        setItems((current) =>
                          current.map((entry, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...entry,
                                  translations: {
                                    ...entry.translations,
                                    [lang]: event.target.value,
                                  },
                                  staleLocales:
                                    entry.staleLocales.filter(
                                      (locale) => locale !== lang,
                                    ),
                                }
                              : entry,
                          ),
                        )
                      }
                      className={`field min-h-28 w-full ${
                        stale ? "border-amber-400" : ""
                      }`}
                    />

                    {stale && (
                      <p className="mt-2 text-xs text-amber-500">
                        Türkçe kaynak değişti. Yeniden çeviri önerilir.
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4 align-top">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        try {
                          await save(item);
                          setStatus(`${item.key} kaydedildi.`);
                        } catch (error) {
                          setStatus(
                            error instanceof Error
                              ? error.message
                              : "Kayıt başarısız.",
                          );
                        }
                      }}
                      className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40"
                    >
                      Kaydet
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}