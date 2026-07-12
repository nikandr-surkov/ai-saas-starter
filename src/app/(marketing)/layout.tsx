import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </>
  );
}
