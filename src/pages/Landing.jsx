import Hero from "../components/landing/Hero";
import LandingHeader from "../components/landing/LandingHeader";
import { Faq, FinalCta, HowItWorks, LandingFooter, Sources } from "../components/landing/Sections";

export default function Landing() {
  return (
    <div id="top">
      <a href="#main" className="skip-link">Lewati ke konten</a>
      <LandingHeader />
      <main id="main">
        <Hero />
        <Sources />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
