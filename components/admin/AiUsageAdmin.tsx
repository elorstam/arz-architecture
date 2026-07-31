"use client";

import {useEffect, useState} from "react";

type Data = {
  todayCost: number;
  monthCost: number;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  estimatedRemaining: number;
  budget: {
    initialCreditUsd: number;
    warningThresholdUsd: number;
    criticalThresholdUsd: number;
  };
  byModel: Array<{
    model: string;
    inputTokens: number;
    outputTokens: number;
    requests: number;
  }>;
  cachedAt: string;
  usageError?: string;
  configurationWarning?: string;
  budgetWarning?: string;
};

const billingUrl = "https://platform.openai.com/settings/organization/billing/overview";

export default function AiUsageAdmin() {
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  async function load() {
    setLoadError("");
    try {
      const response = await fetch("/api/admin/ai-usage");
      const payload = (await response.json()) as Data & {error?: string};
      if (!response.ok) throw new Error(payload.error || "AI kullanım paneli yüklenemedi.");
      setData(payload);
    } catch {
      setLoadError("AI kullanım paneli şu anda yüklenemiyor.");
    }
  }

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, []);

  async function save() {
    if (!data) return;
    setSaveStatus("Kaydediliyor…");
    const response = await fetch("/api/admin/ai-usage", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(data.budget),
    });
    const payload = (await response.json()) as {error?: string};
    if (!response.ok) {
      setSaveStatus(payload.error || "Bütçe ayarları kaydedilemedi.");
      return;
    }
    setSaveStatus("Bütçe ayarları kaydedildi.");
    await load();
  }

  if (loadError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl">AI Kullanımı</h1>
        <p className="mt-4 rounded border border-amber-400/30 p-4 text-amber-100">
          {loadError}
        </p>
        <a className="mt-4 inline-block underline" href={billingUrl} target="_blank" rel="noreferrer">
          OpenAI Billing ekranı
        </a>
      </div>
    );
  }

  if (!data) return <p className="p-6">Kullanım verileri yükleniyor…</p>;

  const critical = data.estimatedRemaining < data.budget.criticalThresholdUsd;
  const warning = data.estimatedRemaining < data.budget.warningThresholdUsd;

  return (
    <div className="p-6">
      <h1 className="text-2xl">AI Kullanımı</h1>

      {data.configurationWarning && (
        <div className="mt-4 border border-sky-400/30 bg-sky-400/10 p-4 text-sky-100">
          {data.configurationWarning}
        </div>
      )}
      {data.usageError && (
        <div className="mt-4 border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
          {data.usageError}
        </div>
      )}
      {data.budgetWarning && (
        <div className="mt-4 border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
          {data.budgetWarning}
        </div>
      )}
      {(critical || warning) && (
        <div className={`my-4 border p-4 ${critical ? "border-red-500 bg-red-500/10 text-red-200" : "border-amber-400 bg-amber-400/10 text-amber-100"}`}>
          {critical ? "Kritik: tahmini bakiye çok düşük." : "Uyarı: tahmini bakiye düşük."}
        </div>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-5">
        {[
          ["Bugün", data.todayCost, "$"],
          ["Bu ay", data.monthCost, "$"],
          ["İstek", data.requests, ""],
          ["Girdi token", data.inputTokens, ""],
          ["Çıktı token", data.outputTokens, ""],
        ].map(([label, value, prefix]) => (
          <div key={String(label)} className="border border-white/10 p-4">
            <p className="text-xs text-white/50">{label}</p>
            <p className="mt-2 text-2xl">{prefix}{Number(value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border border-white/10 p-5">
        <p className="text-sm text-white/50">Tahmini kalan bakiye</p>
        <p className="text-3xl">${data.estimatedRemaining.toFixed(2)}</p>
        <p className="mt-2 text-xs text-white/40">
          Bu değer tahminidir. Kullanım verileri en fazla beş dakika önbelleklenir.
        </p>
        <a className="mt-3 inline-block text-sm underline" href={billingUrl} target="_blank" rel="noreferrer">
          OpenAI Billing ekranını aç
        </a>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Başlangıç bütçesi", "initialCreditUsd"],
          ["Uyarı eşiği", "warningThresholdUsd"],
          ["Kritik eşik", "criticalThresholdUsd"],
        ].map(([label, key]) => (
          <label key={key}>
            {label}
            <input
              type="number"
              min="0"
              step="0.01"
              className="field"
              value={data.budget[key as keyof Data["budget"]]}
              onChange={(event) =>
                setData({
                  ...data,
                  budget: {...data.budget, [key]: Number(event.target.value)},
                })
              }
            />
          </label>
        ))}
      </div>
      <button onClick={save} className="mt-4 bg-white px-5 py-2 text-black">
        Bütçe ayarlarını kaydet
      </button>
      {saveStatus && <p className="mt-3 text-sm text-white/60">{saveStatus}</p>}
    </div>
  );
}
