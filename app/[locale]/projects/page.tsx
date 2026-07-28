import type {Metadata} from "next";
import PremiumFooter from "@/components/PremiumFooter";
import ProjectsGrid from "@/components/ProjectsGrid";
import {getLocalizedStoreProjects} from "@/lib/project-store";

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const en = locale !== "tr";
  return {
    title: en ? "Projects" : "Projeler",
    description: en ? "Explore selected architectural projects designed by ARZ Architecture." : "ARZ Mimarlık tarafından tasarlanan seçili mimari projeleri inceleyin.",
    openGraph: {type: "website", locale: en ? "en_US" : "tr_TR"},
    twitter: {card: "summary_large_image"},
    alternates: {canonical: `/${locale}/${en ? "projects" : "projeler"}`, languages: {tr: "/tr/projeler", en: "/en/projects"}},
  };
}

export default async function ProjectsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const en = locale !== "tr";
  const projects = await getLocalizedStoreProjects(locale);
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="px-5 pb-24 pt-32 sm:px-8 md:px-10 md:pb-32 md:pt-40 lg:px-16 lg:pb-40">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="mb-14 border-b border-white/15 pb-10 md:mb-20 md:pb-14">
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">{en ? "Selected work" : "Seçili çalışmalar"}</p>
            <h1 className="mt-6 text-[clamp(3.8rem,9vw,10rem)] font-light leading-[0.82] tracking-[-0.07em]">{en ? "Projects" : "Projeler"}</h1>
          </div>
          <ProjectsGrid projects={projects} />
        </div>
      </section>
      <PremiumFooter />
    </main>
  );
}
