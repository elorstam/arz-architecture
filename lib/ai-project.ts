import 'server-only';
import type {Project} from '@/data/projects';

export const supportedLocales = ['tr', 'en', 'de', 'fr', 'es', 'nl', 'ar', 'ja', 'ko', 'zh'] as const;
export const translationLocales = ['en', 'de', 'fr', 'es', 'nl', 'ar', 'ja', 'ko', 'zh'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export type TranslationLocale = (typeof translationLocales)[number];
export type ProjectSeo = {metaTitle: string; metaDescription: string; keywords: string[]; openGraphDescription: string};
export type GeneratedTurkishContent = {slugTr: string; slugEn: string; project: Project; seo: ProjectSeo};
export type GeneratedTranslations = {
  translations: Partial<Record<TranslationLocale, Project>>;
  seo: Partial<Record<TranslationLocale, ProjectSeo>>;
};

export class OpenAIRequestError extends Error {
  constructor(message: string, public readonly status: number, public readonly detail: string) {
    super(message);
    this.name = 'OpenAIRequestError';
  }
}

const localeNames: Record<TranslationLocale, string> = {
  en: 'English', de: 'German', fr: 'French', es: 'Spanish', nl: 'Dutch',
  ar: 'Arabic', ja: 'Japanese', ko: 'Korean', zh: 'Simplified Chinese',
};
const stringArray = {type: 'array', items: {type: 'string'}} as const;
const imageSchema = {
  type: 'object', additionalProperties: false, required: ['src', 'alt', 'contain'],
  properties: {src: {type: 'string'}, alt: {type: 'string'}, contain: {type: 'boolean'}},
} as const;
const projectSchema = {
  type: 'object', additionalProperties: false,
  required: ['slug', 'title', 'titleLines', 'category', 'location', 'year', 'services', 'cover', 'coverAlt', 'description', 'detailParagraphs', 'images'],
  properties: {
    slug: {type: 'string'}, title: {type: 'string'}, titleLines: stringArray,
    category: {type: 'string'}, location: {type: 'string'}, year: {type: 'string'},
    services: stringArray, cover: {type: 'string'}, coverAlt: {type: 'string'},
    description: {type: 'string'}, detailParagraphs: stringArray,
    images: {type: 'array', items: imageSchema},
  },
} as const;
const seoSchema = {
  type: 'object', additionalProperties: false,
  required: ['metaTitle', 'metaDescription', 'keywords', 'openGraphDescription'],
  properties: {
    metaTitle: {type: 'string'}, metaDescription: {type: 'string'},
    keywords: stringArray, openGraphDescription: {type: 'string'},
  },
} as const;
const turkishContentSchema = {
  type: 'object', additionalProperties: false,
  required: ['slugTr', 'slugEn', 'project', 'seo'],
  properties: {slugTr: {type: 'string'}, slugEn: {type: 'string'}, project: projectSchema, seo: seoSchema},
} as const;
function createTranslationsSchema(locales: readonly TranslationLocale[]) {
  return {
    type: 'object', additionalProperties: false, required: ['translations', 'seo'],
    properties: {
      translations: {
        type: 'object', additionalProperties: false, required: locales,
        properties: Object.fromEntries(locales.map((locale) => [locale, projectSchema])),
      },
      seo: {
        type: 'object', additionalProperties: false, required: locales,
        properties: Object.fromEntries(locales.map((locale) => [locale, seoSchema])),
      },
    },
  };
}

function extractOutputText(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return;
  const response = data as {output_text?: string; output?: Array<{content?: Array<{type?: string; text?: string}>}>};
  return response.output_text ?? response.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text')?.text;
}

async function requestStructuredOutput<T>(options: {
  schemaName: string;
  schema: object;
  instructions: string;
  input: unknown;
  maxOutputTokens: number;
  validate: (value: unknown) => value is T;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new OpenAIRequestError('OPENAI_API_KEY tanımlı değil.', 503, 'Missing API key');
  for (let attempt = 1; attempt <= 2; attempt++) {
    let response: Response;
    try {
      response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`},
        body: JSON.stringify({
          model: process.env.OPENAI_PROJECT_MODEL || 'gpt-5-mini',
          instructions: options.instructions,
          input: JSON.stringify(options.input),
          max_output_tokens: options.maxOutputTokens,
          text: {format: {type: 'json_schema', name: options.schemaName, strict: true, schema: options.schema}},
        }),
        signal: AbortSignal.timeout(180_000),
      });
    } catch (error) {
      if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
        throw new OpenAIRequestError(
          'AI isteği 180 saniye içinde tamamlanamadı. Lütfen tekrar deneyin.',
          504,
          error.message,
        );
      }
      throw error;
    }
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 2000);
      throw new OpenAIRequestError(`OpenAI isteği başarısız (${response.status}).`, response.status, detail);
    }
    const text = extractOutputText(await response.json());
    try {
      const parsed: unknown = text ? JSON.parse(text) : undefined;
      if (options.validate(parsed)) return parsed;
      throw new Error('Yanıt kesin JSON şemasıyla eşleşmiyor.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Invalid JSON';
      console.error('OpenAI structured output validation failed', {attempt, schema: options.schemaName, detail});
      if (attempt === 2) throw new OpenAIRequestError('OpenAI yanıtı eksik veya bozuk geldi. Otomatik tekrar deneme de başarısız oldu.', 502, detail);
    }
  }
  throw new OpenAIRequestError('OpenAI yanıtı işlenemedi.', 502, 'Unexpected retry state');
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
function isProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Project>;
  return typeof item.slug === 'string' && typeof item.title === 'string'
    && isStringArray(item.titleLines) && typeof item.category === 'string'
    && typeof item.location === 'string' && typeof item.year === 'string'
    && isStringArray(item.services) && typeof item.cover === 'string'
    && typeof item.coverAlt === 'string' && typeof item.description === 'string'
    && isStringArray(item.detailParagraphs) && Array.isArray(item.images)
    && item.images.every((image) => image && typeof image === 'object'
      && typeof image.src === 'string' && typeof image.alt === 'string'
      && typeof image.contain === 'boolean');
}
function isSeo(value: unknown): value is ProjectSeo {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ProjectSeo>;
  return typeof item.metaTitle === 'string' && typeof item.metaDescription === 'string'
    && isStringArray(item.keywords) && typeof item.openGraphDescription === 'string';
}
function isTurkishContent(value: unknown): value is GeneratedTurkishContent {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<GeneratedTurkishContent>;
  return typeof item.slugTr === 'string' && typeof item.slugEn === 'string'
    && isProject(item.project) && isSeo(item.seo);
}

export function generateTurkishProjectContent(project: Project) {
  return requestStructuredOutput<GeneratedTurkishContent>({
    schemaName: 'arz_turkish_project_content',
    schema: turkishContentSchema,
    maxOutputTokens: 4_000,
    validate: isTurkishContent,
    instructions: [
      'You are the senior Turkish content editor for ARZ Architecture.',
      'Improve the supplied Turkish project draft and return only Turkish project content, Turkish SEO, and Turkish/English ASCII URL slugs.',
      'Never invent awards, clients, dimensions, certifications, completion status, or technical facts.',
      'Preserve every image src and contain value. Write concise, useful Turkish alt text.',
      'Use lowercase ASCII slugs with hyphens. metaTitle should normally be 45-60 characters and metaDescription 120-160 characters.',
    ].join(' '),
    input: project,
  });
}

export function generateProjectTranslations(project: Project, seo: ProjectSeo, locales: TranslationLocale[]) {
  if (locales.length < 1 || locales.length > 3) {
    throw new OpenAIRequestError('Her çeviri isteği 1-3 dil içermelidir.', 400, `locale count: ${locales.length}`);
  }
  const localeInstruction = locales.map((locale) => `${locale}: ${localeNames[locale]}`).join(', ');
  return requestStructuredOutput<GeneratedTranslations>({
    schemaName: `arz_project_translations_${locales.join('_')}`,
    schema: createTranslationsSchema(locales),
    maxOutputTokens: 5_000,
    validate: (value): value is GeneratedTranslations => {
      if (!value || typeof value !== 'object') return false;
      const item = value as GeneratedTranslations;
      return locales.every((locale) => isProject(item.translations?.[locale]) && isSeo(item.seo?.[locale]));
    },
    instructions: [
      `Translate the supplied finalized Turkish architecture project and SEO into exactly these locales: ${locales.join(', ')}.`,
      'Keep proper names consistent, localize generic categories and services, and write natural professional copy rather than literal translations.',
      'Preserve every image src, contain value, year, and factual detail. Write localized alt text without keyword stuffing.',
      'Use a lowercase ASCII slug with hyphens in every translated project object.',
      'Keep meta titles and descriptions concise and search-friendly.',
      `Locale map: ${localeInstruction}.`,
    ].join(' '),
    input: {project, seo},
  });
}
