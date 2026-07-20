import { AiNative } from "@/components/marketing/ai-native";
import { Compare } from "@/components/marketing/compare";
import { Gallery } from "@/components/marketing/gallery";
import { CtaBand } from "@/components/marketing/cta-band";
import { Faq } from "@/components/marketing/faq";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { Marquee } from "@/components/marketing/marquee";
import { PricingSection } from "@/components/marketing/pricing-section";
import { siteConfig } from "@/config/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  license: "https://opensource.org/license/mit/",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* v4.1 locked sequence: yellow hero → ink marquee strip → cream
          gallery → mint features → sky agents → cream pricing/compare →
          pink FAQ → ink closing band (DESIGN.md "Landing composition"). */}
      <Hero />
      <Marquee />
      <Gallery />
      <Features />
      <AiNative />
      <PricingSection />
      <Compare />
      <Faq />
      <CtaBand />
    </>
  );
}
