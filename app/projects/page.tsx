import type { Metadata } from "next";
import PremiumFooter from "@/components/PremiumFooter";
import ProjectsGrid from "@/components/ProjectsGrid";

export const metadata: Metadata = {
  title: "Projeler",
  description:
    "ARZ Mimarlık tarafından tasarlanan seçili mimari projeleri inceleyin.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
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

          <ProjectsGrid />
        </div>
      </section>

      <PremiumFooter />
    </main>
  );
}