import Link from "next/link";
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

import { SidebarNav } from "@/components/app/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/config/site";

// Shell only in M1. Session enforcement (middleware redirect + per-page
// re-checks) and the real credit balance arrive with auth in M2.
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh w-full">
      <aside className="hidden w-56 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="font-mono text-sm font-medium">
            {siteConfig.name}
          </Link>
        </div>
        <div className="p-3">
          <SidebarNav />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-6">
          <span className="eyebrow md:hidden">{siteConfig.name}</span>
          <div className="ml-auto flex items-center gap-4">
            <div
              className="flex items-baseline gap-2"
              title="Credit balance (placeholder — wired in M2)"
            >
              <span className="eyebrow">Credits</span>
              <span className="font-mono text-sm">10</span>
            </div>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Account">
                  <UserIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <SettingsIcon />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Wired to Better Auth in M2. */}
                <DropdownMenuItem disabled>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
