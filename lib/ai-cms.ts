import "server-only";

import { OpenAIRequestError } from "@/lib/ai-project";

const seo = {
  type: "object",
  additionalProperties: false,
  required: [
    "metaTitle",
    "metaDescription",
    "keywords",
    "openGraphDescription",
  ],
  properties: {
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    keywords: {
      type: "array",
      items: { type: "string" },
    },
    openGraphDescription: { type: "string" },
  },
};

const post = {
  type: "object",
  additionalProperties: false,
  required: ["title", "excerpt", "content", "slug", "seo"],
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    content: { type: "string" },
    slug: { type: "string" },
    seo,
  },
};

function extractOutputText(data: {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const texts =
    data.output
      ?.flatMap((item) => item.content ?? [])
      .filter(
        (item) =>
          item.type === "output_text" &&
          typeof item.text === "string" &&
          item.text.trim(),
      )
      .map((item) => item.text as string) ?? [];

  return texts.join("").trim() || undefined;
}

async function structured<T>(
  name: string,
  schema: object,
  instructions: string,
  input: unknown,
  max = 5000,
  imageUrl?: string,
): Promise<T> {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new OpenAIRequestError(
      "OPENAI_API_KEY tanımlı değil.",
      503,
      "missing key",
    );
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    let response: Response;

    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_PROJECT_MODEL || "gpt-5-mini",
          instructions,
          input: imageUrl
            ? [
                {
                  role: "user",
                  content: [
                    {
                      type: "input_text",
                      text: JSON.stringify(input),
                    },
                    {
                      type: "input_image",
                      image_url: imageUrl,
                      detail: "high",
                    },
                  ],
                },
              ]
            : JSON.stringify(input),
          max_output_tokens: max,
          text: {
            format: {
              type: "json_schema",
              name,
              strict: true,
              schema,
            },
          },
        }),
        signal: AbortSignal.timeout(180000),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "TimeoutError" ||
          error.name === "AbortError")
      ) {
        throw new OpenAIRequestError(
          "AI isteği zaman aşımına uğradı. Lütfen tekrar deneyin.",
          504,
          error.message,
        );
      }

      throw error;
    }

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 3000);

      throw new OpenAIRequestError(
        `OpenAI isteği başarısız (${response.status}).`,
        response.status,
        detail,
      );
    }

    const data = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        content?: Array<{
          type?: string;
          text?: string;
        }>;
      }>;
      status?: string;
      incomplete_details?: unknown;
    };

    const text = extractOutputText(data);

    try {
      if (!text) {
        throw new Error(
          `boş çıktı; status=${data.status ?? "unknown"}; incomplete=${JSON.stringify(
            data.incomplete_details ?? null,
          )}`,
        );
      }

      return JSON.parse(text) as T;
    } catch (error) {
      console.error("CMS AI JSON validation failed", {
        attempt,
        name,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });

      if (attempt === 2) {
        throw new OpenAIRequestError(
          "AI yanıtı bozuk geldi ve tekrar deneme başarısız oldu.",
          502,
          String(error),
        );
      }
    }
  }

  throw new OpenAIRequestError(
    "AI yanıtı işlenemedi.",
    502,
    "retry state",
  );
}

export function generateBlog(draft: {
  title: string;
  notes: string;
}) {
  return structured<{
    title: string;
    excerpt: string;
    content: string;
    slug: string;
    seo: Record<string, unknown>;
  }>(
    "blog_tr",
    post,
    "ARZ Mimarlık için Türkçe mimarlık blog yazısı taslağı üret. Yalnızca verilen gerçekleri kullan. İçerik HTML paragraf ve başlık etiketleri içerebilir. Slug Latin küçük harf olsun.",
    draft,
    6000,
  );
}

export function translateBlog(
  source: unknown,
  locales: string[],
) {
  const props = Object.fromEntries(
    locales.map((locale) => [locale, post]),
  );

  return structured<Record<string, unknown>>(
    `blog_${locales.join("_")}`,
    {
      type: "object",
      additionalProperties: false,
      required: locales,
      properties: props,
    },
    `Türkçe blog yazısını şu dillere doğal biçimde çevir: ${locales.join(
      ", ",
    )}. Her slug Latin karakterli ve doğal olsun.`,
    source,
    7000,
  );
}

export function generateAltText(imageUrl: string) {
  return structured<{ alt: string }>(
    "media_alt_tr",
    {
      type: "object",
      additionalProperties: false,
      required: ["alt"],
      properties: {
        alt: { type: "string" },
      },
    },
    "Görsel için kısa, doğal, erişilebilir Türkçe alt metin yaz. Mimari tür, cephe, malzeme, mekân ve ışığı yalnızca açıkça görünüyorsa belirt. Anahtar kelime doldurma yapma.",
    {},
    1000,
    imageUrl,
  );
}

const SITE_TRANSLATION_BATCH_SIZE = 6;

function chunkEntries(
  source: Record<string, string>,
  size: number,
) {
  const entries = Object.entries(source);
  const chunks: Array<Record<string, string>> = [];

  for (let index = 0; index < entries.length; index += size) {
    chunks.push(
      Object.fromEntries(entries.slice(index, index + size)),
    );
  }

  return chunks;
}

async function translateStringsBatch(
  source: Record<string, string>,
  locales: string[],
  batchIndex: number,
) {
  const keys = Object.keys(source);

  const language = {
    type: "object",
    additionalProperties: false,
    required: keys,
    properties: Object.fromEntries(
      keys.map((key) => [key, { type: "string" }]),
    ),
  };

  const schema = {
    type: "object",
    additionalProperties: false,
    required: locales,
    properties: Object.fromEntries(
      locales.map((locale) => [locale, language]),
    ),
  };

  return structured<Record<string, Record<string, string>>>(
    `site_strings_${batchIndex}`,
    schema,
    [
      `Türkçe site metinlerini şu dillere doğal ve kısa biçimde çevir: ${locales.join(
        ", ",
      )}.`,
      "Anahtar adlarını kesinlikle değiştirme.",
      "Marka adlarını, iyzico adını, e-posta adreslerini, URL'leri ve teknik kısaltmaları gerektiğinde aynen koru.",
      "Her kaynak anahtar için her hedef dilde mutlaka bir metin döndür.",
      "Yalnızca istenen JSON şemasına uygun çıktı üret.",
    ].join(" "),
    source,
    8000,
  );
}

export async function translateStrings(
  source: Record<string, string>,
  locales: string[],
) {
  const cleanSource = Object.fromEntries(
    Object.entries(source).filter(
      ([, value]) =>
        typeof value === "string" && value.trim().length > 0,
    ),
  );

  const entries = Object.keys(cleanSource);

  if (!entries.length) {
    return Object.fromEntries(
      locales.map((locale) => [locale, {}]),
    ) as Record<string, Record<string, string>>;
  }

  const batches = chunkEntries(
    cleanSource,
    SITE_TRANSLATION_BATCH_SIZE,
  );

  const merged: Record<string, Record<string, string>> =
    Object.fromEntries(
      locales.map((locale) => [locale, {}]),
    );

  for (let index = 0; index < batches.length; index++) {
    const result = await translateStringsBatch(
      batches[index],
      locales,
      index + 1,
    );

    for (const locale of locales) {
      merged[locale] = {
        ...merged[locale],
        ...(result[locale] ?? {}),
      };
    }
  }

  return merged;
}