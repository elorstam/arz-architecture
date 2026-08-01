export type StageDescriptionInput = { stageTitle: string; projectName: string; projectType?: string; currentDescription?: string };

const clean = (value: string | undefined) => (value ?? "").normalize("NFC").replace(/[<>]/g, "").trim();

export function fallbackStageDescription(input: StageDescriptionInput) {
  const title = clean(input.stageTitle);
  const project = clean(input.projectName);
  const type = clean(input.projectType);
  if (!title || !project) throw new Error("stage_description_context_invalid");
  return `${project}${type ? ` (${type})` : ""} projesindeki ${title} aşaması için gerekli çalışmalar planlı biçimde yürütülmektedir. Süreç, ilgili teknik kontroller ve disiplinler arası koordinasyon adımları doğrultusunda değerlendirilmektedir. Gerekli incelemeler tamamlandığında proje bir sonraki onay veya uygulama aşamasına hazır hale getirilecek, süreçteki önemli gelişmeler ve ihtiyaç duyulan kararlar müşteriyle açık biçimde paylaşılacaktır. Bu yaklaşım, takvimin kontrollü ilerlemesini ve tüm paydaşların güncel bilgiye zamanında ulaşmasını destekler.`;
}

export function validateStageDescription(value: string) {
  const text = value.normalize("NFC").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 50 || words > 150 || text.length > 1500 || /[<>]/.test(text)) throw new Error("stage_description_invalid");
  return text;
}
