import "server-only";

import {
  isSupabaseConfigured,
  supabaseSelect,
  supabaseUpsert,
} from "@/lib/supabase-rest";

export type BudgetSettings = {
  initialCreditUsd: number;
  warningThresholdUsd: number;
  criticalThresholdUsd: number;
};

type CostPage = {
  data: Array<{
    start_time: number;
    results: Array<{amount: {value: number; currency: string}}>;
  }>;
};

type UsagePage = {
  data: Array<{
    results: Array<{
      input_tokens: number;
      output_tokens: number;
      num_model_requests: number;
      model?: string | null;
    }>;
  }>;
};

export type UsageResult = {
  todayCost: number;
  monthCost: number;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  estimatedRemaining: number;
  budget: BudgetSettings;
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

const fallbackBudget = (): BudgetSettings => ({
  initialCreditUsd: Number(process.env.OPENAI_INITIAL_CREDIT_USD || 0),
  warningThresholdUsd: 3,
  criticalThresholdUsd: 1,
});

let cache: {expires: number; value: UsageResult} | undefined;

async function getSettings(): Promise<{
  budget: BudgetSettings;
  warning?: string;
}> {
  const fallback = fallbackBudget();
  if (!isSupabaseConfigured()) {
    return {budget: fallback, warning: "Bütçe ayarları için Supabase yapılandırılmamış."};
  }

  try {
    const rows = await supabaseSelect<{
      initial_credit_usd: number;
      warning_threshold_usd: number;
      critical_threshold_usd: number;
    }>("ai_budget_settings", "select=*&id=eq.default");
    const row = rows[0];
    return {
      budget: row
        ? {
            initialCreditUsd: Number(row.initial_credit_usd),
            warningThresholdUsd: Number(row.warning_threshold_usd),
            criticalThresholdUsd: Number(row.critical_threshold_usd),
          }
        : fallback,
    };
  } catch (error) {
    console.error("AI budget settings could not be read from Supabase", error);
    return {
      budget: fallback,
      warning: "Bütçe ayarları şu anda Supabase’den okunamadı. Ortam değişkenindeki başlangıç bütçesi kullanılıyor.",
    };
  }
}

async function openAiGet<T>(path: string): Promise<T> {
  const key = process.env.OPENAI_ADMIN_KEY;
  if (!key) throw new Error("OPENAI_ADMIN_KEY is missing.");

  const response = await fetch(`https://api.openai.com/v1${path}`, {
    headers: {Authorization: `Bearer ${key}`},
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 1000);
    throw new Error(`OpenAI usage API ${response.status}: ${detail}`);
  }
  return response.json() as Promise<T>;
}

function bucketCost(bucket: CostPage["data"][number]) {
  return bucket.results.reduce(
    (sum, result) => sum + Number(result.amount.value || 0),
    0,
  );
}

export async function getUsage(): Promise<UsageResult> {
  if (cache && cache.expires > Date.now()) return cache.value;

  const now = new Date();
  const monthStartUtc = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000,
  );
  const todayStartUtc = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000,
  );
  const {budget, warning: budgetWarning} = await getSettings();

  let monthCosts: CostPage = {data: []};
  let usage: UsagePage = {data: []};
  let usageError: string | undefined;
  let configurationWarning: string | undefined;

  if (!process.env.OPENAI_ADMIN_KEY) {
    configurationWarning = "OPENAI_ADMIN_KEY tanımlanmamış. Kullanım ve maliyet verileri gösterilemiyor.";
  } else {
    try {
      [monthCosts, usage] = await Promise.all([
        openAiGet<CostPage>(
          `/organization/costs?start_time=${monthStartUtc}&bucket_width=1d&limit=31`,
        ),
        openAiGet<UsagePage>(
          `/organization/usage/completions?start_time=${monthStartUtc}&bucket_width=1d&limit=31&group_by=model`,
        ),
      ]);
    } catch (error) {
      console.error("OpenAI usage/cost data could not be retrieved", error);
      usageError = "OpenAI maliyet verileri şu anda alınamadı.";
    }
  }

  const todayCost = monthCosts.data
    .filter((bucket) => bucket.start_time === todayStartUtc)
    .reduce((sum, bucket) => sum + bucketCost(bucket), 0);
  const monthCost = monthCosts.data.reduce(
    (sum, bucket) => sum + bucketCost(bucket),
    0,
  );
  const results = usage.data.flatMap((bucket) => bucket.results);
  const byModel = Object.values(
    results.reduce<Record<string, UsageResult["byModel"][number]>>(
      (all, result) => {
        const model = result.model || "unknown";
        all[model] ??= {
          model,
          inputTokens: 0,
          outputTokens: 0,
          requests: 0,
        };
        all[model].inputTokens += result.input_tokens || 0;
        all[model].outputTokens += result.output_tokens || 0;
        all[model].requests += result.num_model_requests || 0;
        return all;
      },
      {},
    ),
  );

  const value: UsageResult = {
    todayCost,
    monthCost,
    inputTokens: results.reduce((sum, row) => sum + (row.input_tokens || 0), 0),
    outputTokens: results.reduce((sum, row) => sum + (row.output_tokens || 0), 0),
    requests: results.reduce((sum, row) => sum + (row.num_model_requests || 0), 0),
    byModel,
    budget,
    estimatedRemaining: budget.initialCreditUsd - monthCost,
    cachedAt: new Date().toISOString(),
    usageError,
    configurationWarning,
    budgetWarning,
  };

  cache = {expires: Date.now() + 5 * 60 * 1000, value};
  return value;
}

export async function saveBudget(value: BudgetSettings) {
  if (!isSupabaseConfigured()) {
    throw new Error("Bütçe ayarlarını kaydetmek için Supabase yapılandırılmalıdır.");
  }
  await supabaseUpsert(
    "ai_budget_settings",
    {
      id: "default",
      initial_credit_usd: value.initialCreditUsd,
      warning_threshold_usd: value.warningThresholdUsd,
      critical_threshold_usd: value.criticalThresholdUsd,
    },
    "id",
  );
  cache = undefined;
  return value;
}
