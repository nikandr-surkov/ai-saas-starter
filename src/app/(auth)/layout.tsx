import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <Link href="/" className="font-mono text-sm font-medium">
          {siteConfig.name}
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
