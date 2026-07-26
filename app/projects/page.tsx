import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PremiumFooter from "@/components/PremiumFooter";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projeler",
  description:
    "ARZ Mimarlık tarafından tasarlanan seçili mimari projeleri inceleyin.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <Navbar />

      <section className="px-5 pb-24 pt-32 sm:px-8 md:px-10 md:pb-32 md:pt-40 lg:px-16 lg:pb-40">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="mb-14 border-b border-white/15 pb-10 md:mb-20 md:pb-14">
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">
              Seçili çalışmalar
            </p>

            <h1 className="mt-6 text-[clamp(3.8rem,9vw,10rem)] font-light leading-[0.82] tracking-[-0.07em]">
              Projeler
            </h1>
          </div>

          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 md:gap-y-24 lg:gap-x-12">
            {projects.map((project, index) => (
              <article key={project.slug} className="group">
                <Link
                  href={`/projects/${project.slug}`}
                  className="block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#111]">
                    <Image
                      src={project.cover}
                      alt={project.coverAlt}
                      fill
                      priority={index < 2}
                      sizes="(max-width: 767px) 100vw, 50vw"
                      className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
                    />

                    <div className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/15" />

                    <div className="absolute inset-x-0 bottom-0 flex translate-y-4 items-center justify-between px-5 pb-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:px-7 md:pb-7">
                      <span className="text-[9px] uppercase tracking-[0.3em] text-white">
                        Projeyi İncele
                      </span>

                      <span className="text-2xl font-light text-white">
                        →
                      </span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <div className="flex items-center justify-between gap-6">
                      <p className="text-[9px] uppercase tracking-[0.32em] text-white/35">
                        {project.category}
                      </p>

                      <span className="text-lg font-light text-white/40 transition-transform duration-500 group-hover:translate-x-2 group-hover:text-white">
                        →
                      </span>
                    </div>

                    <h2 className="mt-4 text-[clamp(1.8rem,3vw,3.2rem)] font-light leading-[0.95] tracking-[-0.055em] text-white">
                      {project.title}
                    </h2>

                    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[8px] uppercase tracking-[0.28em] text-white/30">
                      <span>{project.location}</span>

                      <span className="h-[3px] w-[3px] rounded-full bg-white/25" />

                      <span>{project.year}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PremiumFooter />
    </main>
  );
}