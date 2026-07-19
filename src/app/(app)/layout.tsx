import Link from "next/link";

import { SidebarNav } from "@/components/app/sidebar-nav";
import { UserMenu } from "@/components/app/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireSession } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";

// The layout renders user data, but it is NOT the security boundary — every
// (app) page re-checks the session itself via requireSession() (layouts
// don't re-run on soft navigation; AGENTS.md: never trust middleware alone).
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();

  return (
    <div className="flex min-h-dvh w-full">
      <aside className="hidden w-56 shrink-0 flex-col border-r-2 bg-sidebar md:flex">
        <div className="flex h-14 items-center border-b-2 px-4">
          <Link href="/dashboard" className="font-mono text-sm font-medium">
            {siteConfig.name}
          </Link>
        </div>
        <div className="p-3">
          <SidebarNav />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b-2 px-6">
          <span className="eyebrow md:hidden">{siteConfig.name}</span>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-baseline gap-2" title="Credit balance">
              <span className="eyebrow">Credits</span>
              <span className="font-mono text-sm" data-testid="credit-balance">
                {session.user.creditBalance}
              </span>
            </div>
            <ThemeToggle />
            <UserMenu name={session.user.name} email={session.user.email} />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
