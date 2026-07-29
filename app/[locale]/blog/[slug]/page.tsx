import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";

import PremiumFooter from "@/components/PremiumFooter";
import {locales} from "@/i18n/locales";
import {getPostBySlug, getPosts, getPostTerms} from "@/lib/post-store";
import {getSiteMessages} from "@/lib/site-translation-store";

type Props = {params: Promise<{locale: string; slug: string}>};
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://arzmimarlik.net").replace(/\/$/, "");

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const post = await getPostBySlug(locale, slug);
  if (!post) return {};
  const content = post.translations[locale] || post.translations.tr;
  const seo = post.seo[locale] || post.seo.tr;
  const currentSlug = post.slugs[locale] || post.slugs.tr;
  const title = seo?.metaTitle || content.title;
  const description = seo?.metaDescription || content.excerpt;
  const image = post.coverUrl ? [post.coverUrl] : [];
  return {
    title,
    description,
    keywords: seo?.keywords,
    alternates: {
      canonical: `/${locale}/blog/${currentSlug}`,
      languages: Object.fromEntries(
        locales.map((item) => [item, `/${item}/blog/${post.slugs[item] || post.slugs.tr}`]),
      ),
    },
    openGraph: {
      type: "article",
      locale,
      url: `/${locale}/blog/${currentSlug}`,
      title,
      description: seo?.openGraphDescription || description,
      images: image,
      publishedTime: post.publishAt || undefined,
    },
    twitter: {card: "summary_large_image", title, description, images: image},
  };
}

export default async function PostPage({params}: Props) {
  const {locale, slug} = await params;
  const [post, posts, terms, copy] = await Promise.all([
    getPostBySlug(locale, slug),
    getPosts(),
    getPostTerms(),
    getSiteMessages(locale),
  ]);
  if (!post) notFound();

  const content = post.translations[locale] || post.translations.tr;
  const currentSlug = post.slugs[locale] || post.slugs.tr;
  const category = terms.categories.find((item) => item.id === post.categoryId);
  const tags = terms.tags.filter((item) => post.tagIds.includes(item.id));
  const categoryName = category
    ? category.translations[locale] || category.translations.tr || category.slug
    : "";
  const related = posts
    .filter((item) => item.id !== post.id && (!post.categoryId || item.categoryId === post.categoryId))
    .slice(0, 3);
  const canonical = `${siteUrl}/${locale}/blog/${currentSlug}`;
  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: content.title,
    description: content.excerpt,
    image: post.coverUrl || undefined,
    datePublished: post.publishAt,
    dateModified: post.updatedAt || post.publishAt,
    author: {"@type": "Person", name: post.author},
    mainEntityOfPage: canonical,
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {"@type": "ListItem", position: 1, name: copy["blog.title"], item: `${siteUrl}/${locale}/blog`},
      {"@type": "ListItem", position: 2, name: content.title, item: canonical},
    ],
  };

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <article className="px-5 pb-28 pt-32 md:px-10 md:pt-40 lg:px-16">
        <div className="mx-auto max-w-[1500px]">
          <Link href={`/${locale}/blog`} className="text-[10px] uppercase tracking-[.22em] text-white/45 hover:text-white">
            ← {copy["blog.backToBlog"]}
          </Link>
          <header className="mx-auto mt-12 max-w-5xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 text-[9px] uppercase tracking-[.22em] text-white/38">
              {categoryName && <span>{categoryName}</span>}
              {post.publishAt && <time dateTime={post.publishAt}>{new Intl.DateTimeFormat(locale, {dateStyle: "long"}).format(new Date(post.publishAt))}</time>}
            </div>
            <h1 className="mt-7 text-[clamp(3rem,7vw,7rem)] font-light leading-[.9] tracking-[-.06em]">{content.title}</h1>
            <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-white/52">{content.excerpt}</p>
          </header>
          {post.coverUrl && (
            <div className="relative mt-16 aspect-[16/9] overflow-hidden bg-white/5">
              <Image src={post.coverUrl} alt={content.title} fill unoptimized priority className="object-cover" />
            </div>
          )}
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="blog-content text-base leading-8 text-white/72" dangerouslySetInnerHTML={{__html: content.content}} />
            {tags.length > 0 && (
              <div className="mt-14 border-t border-white/12 pt-6">
                <p className="text-[9px] uppercase tracking-[.24em] text-white/35">{copy["blog.tags"]}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => <span key={tag.id} className="border border-white/15 px-3 py-2 text-xs text-white/55">{tag.translations[locale] || tag.translations.tr || tag.slug}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-white/12 px-5 py-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-[1500px]">
            <h2 className="text-3xl font-light tracking-[-.035em]">{copy["blog.related"]}</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {related.map((item) => {
                const translated = item.translations[locale] || item.translations.tr;
                return <Link key={item.id} href={`/${locale}/blog/${item.slugs[locale] || item.slugs.tr}`} className="border-t border-white/15 pt-5"><p className="text-xl font-light">{translated.title}</p><span className="mt-4 inline-block text-[9px] uppercase tracking-[.2em] text-white/40">{copy["blog.readMore"]}</span></Link>;
              })}
            </div>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(blogPosting).replace(/</g, "\\u003c")}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c")}} />
      <PremiumFooter />
    </main>
  );
}
