import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import { getManagedBySlug } from "@/lib/project-store";
import { locales } from "@/i18n/locales";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const managed = await getManagedBySlug(slug);
  if (!managed) return { title: "Proje bulunamadı" };

  const project = managed.translations?.[locale] || managed.tr;
  const segment = locale === "tr" ? "projeler" : "projects";
  const canonicalSlug = project.slug || managed.slugTr;
  const seo = managed.seo?.[locale] || managed.seo?.tr;
  const title = seo?.metaTitle || project.title;
  const description = seo?.metaDescription || project.description;
  const ogDescription = seo?.openGraphDescription || description;

  return {
    title,
    description,
    keywords: seo?.keywords,
    alternates: {
      canonical: `/${locale}/${segment}/${canonicalSlug}`,
      languages: Object.fromEntries(
        locales.map((item) => {
          const translated = managed.translations?.[item] || managed.tr;
          return [
            item,
            `/${item}/${item === "tr" ? "projeler" : "projects"}/${translated.slug || managed.slugTr}`,
          ];
        }),
      ),
    },
    openGraph: {
      locale,
      url: `/${locale}/${segment}/${canonicalSlug}`,
      title,
      description: ogDescription,
      images: [{ url: project.cover, alt: project.coverAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
      images: [project.cover],
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const managed = await getManagedBySlug(slug);
  if (!managed || !managed.published) notFound();

  const project = managed.translations?.[locale] || managed.tr;
  const canonicalSlug = project.slug || managed.slugTr;
  if (slug !== canonicalSlug) {
    redirect(`/${locale}/${locale === "tr" ? "projeler" : "projects"}/${canonicalSlug}`);
  }
  return <ProjectDetail project={project} />;
}
