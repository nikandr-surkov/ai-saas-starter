"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCardIcon,
  ImageIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/generate", label: "Generate", icon: ImageIcon },
  { href: "/billing", label: "Billing", icon: CreditCardIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-3 py-1.5 text-sm transition-colors",
              // Active nav gets the marker treatment (DESIGN.md v3).
              active
                ? "border-2 bg-pop-yellow font-semibold text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
