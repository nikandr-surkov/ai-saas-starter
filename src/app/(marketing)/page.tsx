import { AiNative } from "@/components/marketing/ai-native";
import { CodeExhibit } from "@/components/marketing/code-exhibit";
import { Compare } from "@/components/marketing/compare";
import { CtaBand } from "@/components/marketing/cta-band";
import { Faq } from "@/components/marketing/faq";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { PricingSection } from "@/components/marketing/pricing-section";
import { StackStrip } from "@/components/marketing/stack-strip";
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
      <Hero />
      <StackStrip />
      <Features />
      <CodeExhibit />
      <AiNative />
      <PricingSection />
      <Compare />
      <Faq />
      <CtaBand />
    </>
  );
}
