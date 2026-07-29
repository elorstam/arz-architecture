import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";

import PremiumFooter from "@/components/PremiumFooter";
import {locales} from "@/i18n/locales";
import {getPosts, getPostTerms} from "@/lib/post-store";
import {getSiteMessages} from "@/lib/site-translation-store";

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const copy = await getSiteMessages(locale);
  const title = copy["blog.title"];
  const description = copy["blog.intro"];
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/blog`,
      languages: Object.fromEntries(locales.map((item) => [item, `/${item}/blog`])),
    },
    openGraph: {type: "website", locale, title, description, url: `/${locale}/blog`},
    twitter: {card: "summary_large_image", title, description},
  };
}

export default async function BlogPage({params}: Props) {
  const {locale} = await params;
  const [posts, terms, copy] = await Promise.all([
    getPosts(),
    getPostTerms(),
    getSiteMessages(locale),
  ]);
  const categoryNames = new Map(
    terms.categories.map((item) => [
      item.id,
      item.translations[locale] || item.translations.tr || item.slug,
    ]),
  );

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="px-5 pb-28 pt-32 md:px-10 md:pt-40 lg:px-16">
        <div className="mx-auto max-w-[1800px]">
          <header className="grid gap-8 border-b border-white/15 pb-12 lg:grid-cols-[1fr_.65fr] lg:items-end">
            <div>
              <p className="text-[9px] uppercase tracking-[.4em] text-white/35">
                {copy["blog.eyebrow"]}
              </p>
              <h1 className="mt-6 text-[clamp(4rem,10vw,11rem)] font-light leading-[.8] tracking-[-.07em]">
                {copy["blog.title"]}
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/48 lg:pb-2">
              {copy["blog.intro"]}
            </p>
          </header>

          {!posts.length ? (
            <p className="py-20 text-white/50">{copy["blog.empty"]}</p>
          ) : (
            <div className="grid gap-x-8 gap-y-16 pt-14 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => {
                const content = post.translations[locale] || post.translations.tr;
                const slug = post.slugs[locale] || post.slugs.tr;
                return (
                  <article key={post.id} className="group border-b border-white/12 pb-10">
                    <Link href={`/${locale}/blog/${slug}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                        {post.coverUrl && (
                          <Image
                            src={post.coverUrl}
                            alt={content.title}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.025]"
                          />
                        )}
                      </div>
                      <div className="mt-6 flex items-center justify-between gap-4 text-[9px] uppercase tracking-[.22em] text-white/35">
                        <span>{categoryNames.get(post.categoryId || "") || copy["blog.category"]}</span>
                        <time dateTime={post.publishAt || undefined}>
                          {post.publishAt ? new Intl.DateTimeFormat(locale, {dateStyle: "medium"}).format(new Date(post.publishAt)) : ""}
                        </time>
                      </div>
                      <h2 className="mt-5 text-[clamp(1.7rem,3vw,2.7rem)] font-light leading-[1.05] tracking-[-.035em]">
                        {content.title}
                      </h2>
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/48">
                        {content.excerpt}
                      </p>
                      <span className="mt-7 inline-flex border-b border-white/35 pb-1 text-[10px] uppercase tracking-[.2em] text-white/70">
                        {copy["blog.readMore"]}
                      </span>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <PremiumFooter />
    </main>
  );
}
