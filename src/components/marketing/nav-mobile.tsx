"use client";

import * as React from "react";

import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";

// Mobile drawer in the chip grammar (DESIGN.md v4.1 Nav): a bordered
// panel of pill links under the header. Plain disclosure — no portal.
export function MobileMenu({
  links,
}: {
  links: readonly { href: string; label: string }[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="chip flex size-8 items-center justify-center"
      >
        {open ? (
          <XIcon className="size-4" aria-hidden />
        ) : (
          <MenuIcon className="size-4" aria-hidden />
        )}
      </button>
      {open ? (
        <nav className="absolute inset-x-0 top-full border-b-[3px] bg-background px-6 py-4">
          <ul className="flex flex-col gap-2.5">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="chip inline-block px-3.5 py-1.5 text-sm font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
