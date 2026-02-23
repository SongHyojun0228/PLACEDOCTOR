import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ScoreDemo from "@/components/landing/ScoreDemo";
import SocialProof from "@/components/landing/SocialProof";
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
        <HowItWorks />
        <ScoreDemo />
        <SocialProof />
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
