import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyNow from "@/components/WhyNow";
import Membership from "@/components/Membership";
import Founder from "@/components/Founder";
import Videos from "@/components/Videos";
import Approach from "@/components/Approach";
import DashboardShowcase from "@/components/DashboardShowcase";
import Testimonials from "@/components/Testimonials";
import Partners from "@/components/Partners";
import HowToJoin from "@/components/HowToJoin";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import TelegramRedirect from "@/components/TelegramRedirect";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Cycle Partners — Pôle Invest",
  url: "https://invest.informateurcrypto.fr",
  description:
    "Desk d'investissement privé piloté par Julien Moretto. Crypto, IA, actions US, semi-conducteurs et narratives macro du prochain cycle.",
  founder: {
    "@type": "Person",
    name: "Julien Moretto",
    jobTitle: "Conseiller financier indépendant",
    sameAs: ["https://www.linkedin.com/in/julien-moretto/"],
  },
  areaServed: "FR",
};

export default function Page() {
  return (
    <>
      <TelegramRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <WhyNow />
        <Membership />
        <Founder />
        <Videos />
        <Approach />
        <DashboardShowcase />
        <Testimonials />
        <Partners />
        <HowToJoin />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
