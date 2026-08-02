export const STUDIO_AI_OPERATIONS = {
  official_processes: ["fee_ai_whatsapp_message"],
  project_stages: ["stage_ai_description"],
  crm: ["crm_ai_meeting_note"],
  proposals: ["proposal_ai_description"],
  decision_log: ["decision_ai_summary"],
  renders: ["render_description", "render_analysis"],
} as const;

export type StudioAiModule = keyof typeof STUDIO_AI_OPERATIONS;
export type StudioAiOperation = (typeof STUDIO_AI_OPERATIONS)[StudioAiModule][number];
export type StudioAiOutputFormat = "paragraph" | "bullets" | "structured";
export type StudioAiContext = Readonly<Record<string, string | number | boolean | null | string[]>>;

export function isStudioAiOperation(module: string, operation: string): module is StudioAiModule {
  return module in STUDIO_AI_OPERATIONS && (STUDIO_AI_OPERATIONS[module as StudioAiModule] as readonly string[]).includes(operation);
}

export type StudioAiWritingResult = {
  text: string;
  model: string | null;
  usage: {inputTokens: number | null; outputTokens: number | null; totalTokens: number | null; cachedInputTokens: number | null; reasoningTokens: number | null};
  providerRequestId: string | null;
  fallbackUsed: boolean;
  safeErrorCode: string | null;
};
