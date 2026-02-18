import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import ScoreDemo from "@/components/landing/ScoreDemo";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <ScoreDemo />
        <Features />
        <Pricing />
        <FAQ />
        <div id="cta">
          <CTASection />
        </div>
      </main>
      <Footer />
    </>
  );
}
