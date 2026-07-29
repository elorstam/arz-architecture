import type {ProjectSeo} from '@/lib/ai-project';

export type PostStatus = 'draft' | 'published' | 'scheduled';
export type PostTranslation = {title: string; excerpt: string; content: string};
export type ManagedPost = {
  id: string; status: PostStatus; author: string; coverUrl: string; categoryId: string | null;
  tagIds: string[]; publishAt: string | null; translations: Record<string, PostTranslation>;
  seo: Record<string, ProjectSeo>; slugs: Record<string, string>; createdAt?: string; updatedAt?: string;
};
export type MediaItem = {
  id: string; filename: string; storagePath: string; url: string; mimeType: string; sizeBytes: number;
  width: number | null; height: number | null; altTexts: Record<string, string>; createdAt: string;
};
export type SiteTranslation = {
  key: string; sourceTr: string; translations: Record<string, string>; staleLocales: string[]; updatedAt?: string;
};
