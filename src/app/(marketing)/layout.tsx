import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // v4 LOUD register: raised border/shadow tiers for the whole marketing
    // shell; solid color blocking per section — no dot-grid behind text.
    <div className="loud flex flex-1 flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
