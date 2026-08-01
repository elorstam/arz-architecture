const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type OptionalStageDates = { startedAt: string | null; completedAt: string | null };

function optionalDate(value: unknown, field: "startedAt" | "completedAt") {
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (!ISO_DATE.test(text)) throw new Error(field === "startedAt" ? "stage_start_date_invalid" : "stage_completion_date_invalid");
  const date = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) throw new Error(field === "startedAt" ? "stage_start_date_invalid" : "stage_completion_date_invalid");
  return text;
}

export function validateOptionalStageDates(startedAt: unknown, completedAt: unknown): OptionalStageDates {
  const start = optionalDate(startedAt, "startedAt");
  const completion = optionalDate(completedAt, "completedAt");
  if (start && completion && completion < start) throw new Error("stage_date_order_invalid");
  return { startedAt: start, completedAt: completion };
}
