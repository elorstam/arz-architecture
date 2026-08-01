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
  studio?: StudioUsageSummary;
};

type StudioUsageRow={module:string;operation:string;model:string|null;input_tokens:number|null;output_tokens:number|null;total_tokens:number|null;estimated_cost_usd:number|null;status:string;fallback_used:boolean;usage_unavailable:boolean;pricing_unknown:boolean;organization_id:string;user_id:string;created_at:string};
export type StudioUsageFilters={from?:string;to?:string;module?:string;operation?:string;model?:string;organizationId?:string;userId?:string;status?:string;fallbackUsed?:boolean;usageUnavailable?:boolean;pricingUnknown?:boolean};
export type StudioUsageSummary={requests:number;todayRequests:number;successful:number;failed:number;fallback:number;usageUnavailable:number;pricingUnknown:number;totalTokens:number;estimatedCostUsd:number|null;byModule:Array<{module:string;requests:number;totalTokens:number}>;byOperation:Array<{operation:string;requests:number;totalTokens:number}>;byModel:Array<{model:string;requests:number;inputTokens:number;outputTokens:number;totalTokens:number;estimatedCostUsd:number|null}>};
const studioGroup=<T extends string>(rows:StudioUsageRow[],key:(row:StudioUsageRow)=>T)=>Object.values(rows.reduce<Record<string,{key:T;requests:number;totalTokens:number}>>((all,row)=>{const value=key(row);all[value]??={key:value,requests:0,totalTokens:0};all[value].requests++;all[value].totalTokens+=Number(row.total_tokens||0);return all},{}));
async function getStudioUsage(filters:StudioUsageFilters={}):Promise<StudioUsageSummary>{try{const clauses=["select=module,operation,model,input_tokens,output_tokens,total_tokens,estimated_cost_usd,status,fallback_used,usage_unavailable,pricing_unknown,organization_id,user_id,created_at","order=created_at.desc","limit=5000"];const eq=(column:string,value:unknown)=>{if(value!==undefined&&value!=="")clauses.push(`${column}=eq.${encodeURIComponent(String(value))}`)};eq("module",filters.module);eq("operation",filters.operation);eq("model",filters.model);eq("organization_id",filters.organizationId);eq("user_id",filters.userId);eq("status",filters.status);eq("fallback_used",filters.fallbackUsed);eq("usage_unavailable",filters.usageUnavailable);eq("pricing_unknown",filters.pricingUnknown);if(filters.from)clauses.push(`created_at=gte.${encodeURIComponent(filters.from)}`);if(filters.to)clauses.push(`created_at=lte.${encodeURIComponent(filters.to)}`);const rows=await supabaseSelect<StudioUsageRow>("studio_ai_usage_events",clauses.join("&"));const today=new Date().toISOString().slice(0,10);const costs=rows.map(row=>row.estimated_cost_usd).filter((value):value is number=>value!==null);const modules=studioGroup(rows,row=>row.module).map(item=>({module:item.key,requests:item.requests,totalTokens:item.totalTokens}));const operations=studioGroup(rows,row=>row.operation).map(item=>({operation:item.key,requests:item.requests,totalTokens:item.totalTokens}));const models=Object.values(rows.reduce<Record<string,StudioUsageSummary["byModel"][number]>>((all,row)=>{const key=row.model||"unknown";all[key]??={model:key,requests:0,inputTokens:0,outputTokens:0,totalTokens:0,estimatedCostUsd:null};const item=all[key];item.requests++;item.inputTokens+=Number(row.input_tokens||0);item.outputTokens+=Number(row.output_tokens||0);item.totalTokens+=Number(row.total_tokens||0);if(row.estimated_cost_usd!==null)item.estimatedCostUsd=(item.estimatedCostUsd??0)+Number(row.estimated_cost_usd);return all},{}));return{requests:rows.length,todayRequests:rows.filter(row=>row.created_at.startsWith(today)).length,successful:rows.filter(row=>row.status==="success").length,failed:rows.filter(row=>row.status==="failed").length,fallback:rows.filter(row=>row.fallback_used).length,usageUnavailable:rows.filter(row=>row.usage_unavailable).length,pricingUnknown:rows.filter(row=>row.pricing_unknown).length,totalTokens:rows.reduce((sum,row)=>sum+Number(row.total_tokens||0),0),estimatedCostUsd:costs.length?costs.reduce((sum,value)=>sum+Number(value),0):null,byModule:modules,byOperation:operations,byModel:models};}catch{return{requests:0,todayRequests:0,successful:0,failed:0,fallback:0,usageUnavailable:0,pricingUnknown:0,totalTokens:0,estimatedCostUsd:null,byModule:[],byOperation:[],byModel:[]};}}

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

export async function getUsage(filters:StudioUsageFilters={}): Promise<UsageResult> {
  if (cache && cache.expires > Date.now()&&Object.keys(filters).length===0) return cache.value;

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
    studio:await getStudioUsage(filters),
  };

  if(Object.keys(filters).length===0)cache = {expires: Date.now() + 5 * 60 * 1000, value};
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
