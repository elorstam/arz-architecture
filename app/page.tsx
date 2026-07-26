import Hero from "@/components/Hero";
import IntroLoader from "@/components/IntroLoader";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <main className="bg-[#090909]">
      <IntroLoader />
      <Navbar />
      <Hero />
    </main>
  );
}