import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LedgerList, LedgerRow } from "@/components/ledger-row";
import { LedgerTable } from "@/components/ledger-table";
import { DigitBoxes } from "@/components/digit-boxes";
import { Asterisk, Sparkle, Squiggle } from "@/components/doodads";
import { Sticker } from "@/components/sticker";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { ToastDemo } from "./toast-demo";

export const metadata: Metadata = {
  title: "Styleguide — The Ledger",
  robots: { index: false },
};

// Dev-only reference for the design system in DESIGN.md: every restyled
// primitive and both ledger components on one page, in both themes, so
// design changes can be reviewed at a glance. Deliberately guarded out of
// production and linked from no nav — it is a workbench, not a page.
//
// Theme: follows the site theme (toggle in the header). `?theme=dark`
// force-wraps the page in `.dark` regardless — used for screenshots.

const swatches = [
  { name: "canvas", className: "bg-background" },
  { name: "ink", className: "bg-foreground" },
  { name: "pop-yellow (action)", className: "bg-pop-yellow" },
  { name: "pop-mint", className: "bg-pop-mint" },
  { name: "pop-sky", className: "bg-pop-sky" },
  { name: "pop-pink", className: "bg-pop-pink" },
  { name: "pop-orange", className: "bg-pop-orange" },
  { name: "credit", className: "bg-credit" },
  { name: "credit-text", className: "bg-credit-text" },
  { name: "debit", className: "bg-debit-text" },
] as const;

const ledgerEntries = [
  {
    id: "1",
    timestamp: "2026-07-12 09:14",
    type: "subscription_grant",
    ref: "invoice in_1Nx4h2",
    amount: 200,
  },
  {
    id: "2",
    timestamp: "2026-07-12 09:20",
    type: "spend",
    ref: "generation gen_84h1a0",
    amount: -1,
  },
  {
    id: "3",
    timestamp: "2026-07-12 09:21",
    type: "refund",
    ref: "generation gen_84h1a0",
    amount: 1,
  },
  {
    id: "4",
    timestamp: "2026-07-11 18:02",
    type: "topup",
    ref: "checkout cs_a1b2c3",
    amount: 100,
  },
  {
    id: "5",
    timestamp: "2026-07-01 00:00",
    type: "expiry",
    ref: "policy pro_annual",
    amount: -40,
  },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t-2 border-rule pt-6">
      <h2 className="eyebrow">{title}</h2>
      {children}
    </section>
  );
}

export default async function StyleguidePage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { theme } = await searchParams;

  return (
    <div className={theme === "dark" ? "dark" : undefined}>
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-[1160px] space-y-12 px-6 py-16">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Styleguide · dev only · v4</p>
              <h1 className="mt-2 text-3xl">
                The Ledger, <span className="marker">LOUD</span>
              </h1>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <Link href="/styleguide" className="underline underline-offset-4">
                site theme
              </Link>
              <Link
                href="/styleguide?theme=dark"
                className="underline underline-offset-4"
              >
                force dark
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <Section title="Tokens">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {swatches.map((swatch) => (
                <div key={swatch.name} className="space-y-1.5">
                  <div
                    className={`h-14 rounded-sm border ${swatch.className}`}
                  />
                  <p className="font-mono text-xs text-muted-foreground">
                    {swatch.name}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Typography — four faces, four jobs">
            <p className="text-display max-w-4xl">A complete AI SaaS. Free.</p>
            <p className="text-title max-w-3xl">Section titles pop.</p>
            <h3 className="text-xl">Subhead — Bricolage Grotesque 700/800</h3>
            <p className="max-w-xl text-muted-foreground">
              Body text in Instrument Sans. Muted ink on solid color. Concrete
              copy: Next.js 16, Better Auth 1.5, Drizzle, Stripe, AI SDK 6.
            </p>
            <p className="eyebrow">Eyebrow — Martian Mono 11px +0.12em</p>
            <p className="font-mono text-sm">
              1,024 credits · $29.00 · 2026-07-12 — tabular numerals
            </p>
          </Section>

          <Section title="Stickers, markers, doodads, digit boxes">
            <div className="flex flex-wrap items-center gap-4">
              <Sticker>10 free credits</Sticker>
              <Sticker color="mint" className="rotate-2">
                MIT · Open source
              </Sticker>
              <Sticker color="pink" className="rotate-1">
                Most popular
              </Sticker>
              <Sparkle className="text-pop-orange" />
              <Asterisk className="text-pop-sky" />
              <Squiggle className="text-pop-pink" />
            </div>
            <p className="max-w-md text-lg">
              Inline emphasis on canvas gets the{" "}
              <span className="marker">marker swoosh</span>; big titles carry
              the offset <span className="text-title text-lg">shadow</span>.
            </p>
            <DigitBoxes value={210} label="Credit balance" />
          </Section>

          <Section title="Buttons">
            <div className="flex flex-wrap items-center gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Delete account</Button>
              <Button variant="link">Link</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="lg">Large</Button>
              <Button size="default">Default</Button>
              <Button size="sm">Small</Button>
              <Button size="xs">Extra small</Button>
            </div>
          </Section>

          <Section title="Form">
            <div className="grid max-w-md gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="sg-email">Email</Label>
                <Input
                  id="sg-email"
                  type="email"
                  placeholder="you@ledger.dev"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="sg-invalid">Invalid state</Label>
                <Input
                  id="sg-invalid"
                  aria-invalid
                  defaultValue="not-an-email"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="sg-prompt">Prompt</Label>
                <Textarea
                  id="sg-prompt"
                  placeholder="A ledger book on a desk, studio light"
                />
              </div>
            </div>
          </Section>

          <Section title="Shadow tiers — one direction, register-scoped">
            <div className="flex flex-wrap items-end gap-8 font-mono text-xs">
              <div className="shadow-hard-sm rounded-lg border-2 bg-background px-5 py-4">
                sm 3px app / 6px marketing — badges, chips, app cards
              </div>
              <div className="shadow-hard rounded-lg border-2 bg-background px-5 py-4">
                md 5px / 9px — marketing cards, buttons
              </div>
              <div className="shadow-hard-lg rounded-lg border-2 bg-background px-5 py-4">
                lg 8px / 12px — dialogs, menus, toasts
              </div>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              The .loud marketing scope raises the tiers and border widths (3px
              base, 4px hero); the app keeps the calm values shown here.
            </p>
          </Section>

          <Section title="Selection controls & skeleton">
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2.5">
                <Checkbox id="sg-check" defaultChecked />
                <Label htmlFor="sg-check">Email me receipts</Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch id="sg-switch" defaultChecked />
                <Label htmlFor="sg-switch">Mock mode</Label>
              </div>
            </div>
            <div className="grid max-w-md gap-3">
              <div className="flex gap-3">
                <Skeleton className="size-14" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Card — app register, tinted header">
            <Card className="max-w-sm pt-0">
              <CardHeader className="border-b-2 bg-pop-sky py-3.5">
                <p className="eyebrow">Current plan</p>
                <CardTitle>Pro — 200 credits/mo</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Renews 2026-08-12. Credits accumulate; no expiry in the free
                version.
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Manage subscription</Button>
                <Button size="sm" variant="outline">
                  Buy top-up
                </Button>
              </CardFooter>
            </Card>
          </Section>

          <Section title="Ledger table — the register">
            <LedgerTable entries={ledgerEntries} className="max-w-2xl" />
          </Section>

          <Section title="Ledger rows — marketing lists">
            <LedgerList className="max-w-2xl">
              <LedgerRow
                index="01"
                title="Auth that hides what you haven't configured"
                description="Email/password, Google, GitHub, magic links — buttons appear only when env keys exist."
                meta="Better Auth"
              />
              <LedgerRow
                index="02"
                title="Webhooks that survive retries"
                description="One sync function writes subscription state; idempotency keys make replays no-ops."
                meta="Stripe"
              />
              <LedgerRow
                index="03"
                title="Append-only credits ledger"
                description="Signed integer rows, compensating corrections, balance cache proven by tests."
                meta="Postgres"
              />
            </LedgerList>
          </Section>

          <Section title="Overlays">
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel subscription?</DialogTitle>
                    <DialogDescription>
                      Your remaining credits stay usable. The plan ends at the
                      period close.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter showCloseButton>
                    <Button variant="destructive">Cancel subscription</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    Delete account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <ToastDemo />
          </Section>
        </div>
      </div>
    </div>
  );
}
