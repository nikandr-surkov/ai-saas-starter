import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { eq, sql } from "drizzle-orm";

import { plans } from "@/config/plans";
import { db } from "@/db";
import { generations, subscriptions } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { planByPriceId } from "@/lib/billing/plans";
import { getHistory } from "@/lib/credits";
import { features } from "@/lib/env";
import { CountUpDigits } from "@/components/count-up-digits";
import { PageHeader } from "@/components/app/page-header";
import { LedgerTable, type LedgerEntry } from "@/components/ledger-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

function formatTimestamp(date: Date): string {
  // UTC, ledger style: 2026-07-13 09:14
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function formatRef(refType: string | null, refId: string | null): string {
  if (!refType || !refId) return "—";
  const id = refId.length > 16 ? `${refId.slice(0, 16)}…` : refId;
  return `${refType} ${id}`;
}

export default async function DashboardPage() {
  const session = await requireSession();

  const [history, [sub], [generated]] = await Promise.all([
    getHistory(session.user.id, 10),
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(generations)
      .where(eq(generations.userId, session.user.id)),
  ]);

  const isActive = sub?.status === "active" || sub?.status === "trialing";
  const currentPlan =
    (isActive && sub?.priceId && planByPriceId(sub.priceId)) || plans.free;

  const entries: LedgerEntry[] = history.map((tx) => ({
    id: tx.id,
    timestamp: formatTimestamp(tx.createdAt),
    type: tx.type,
    ref: formatRef(tx.refType, tx.refId),
    amount: tx.amount,
  }));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Overview" title="Dashboard" />

      {features.email && !session.user.emailVerified ? (
        <div className="max-w-2xl rounded-md border-2 border-l-[6px] border-l-pop-orange px-5 py-4">
          <p className="eyebrow">Verify your email</p>
          <p className="mt-1 text-sm">
            We sent a link to {session.user.email}. Everything works meanwhile —
            verifying keeps the account recoverable.
          </p>
        </div>
      ) : null}

      {(generated?.count ?? 0) === 0 ? (
        <div className="flex max-w-2xl items-center gap-5 rounded-md border-2 border-l-[6px] border-l-pop-sky px-5 py-4">
          <Image
            src="/illustrations/mascot-hello.png"
            alt="Gold coin mascot with sunglasses pushed up, waving hello"
            width={96}
            height={96}
            className="size-24 shrink-0"
          />
          <div>
            <p className="eyebrow">First steps</p>
            <p className="mt-1 text-sm">
              Your welcome credits are on the books. Head to{" "}
              <Link href="/generate" className="link-pop">
                Generate
              </Link>{" "}
              to spend the first one — each image costs 1 credit and failed
              generations refund themselves. Plans and top-ups live in{" "}
              <Link href="/billing" className="link-pop">
                Billing
              </Link>
              .
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Card className="pt-0">
          {/* v4 medium-fun app register: panel-colored header strip with
              an ink rule over a cream body. */}
          <CardHeader className="border-b-2 bg-pop-yellow py-3.5">
            <p className="eyebrow">Credits</p>
            <CardTitle>
              <CountUpDigits value={session.user.creditBalance ?? 0} />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <Link href="/billing" className="link-pop">
              Buy more
            </Link>{" "}
            or{" "}
            <Link href="/generate" className="link-pop">
              generate an image
            </Link>
            .
          </CardContent>
        </Card>
        <Card className="pt-0">
          <CardHeader className="border-b-2 bg-pop-mint py-3.5">
            <p className="eyebrow">Plan</p>
            <CardTitle>{currentPlan.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {isActive && sub?.currentPeriodEnd ? (
              <>
                {sub.cancelAtPeriodEnd ? "Ends" : "Renews"}{" "}
                <span className="font-mono">
                  {sub.currentPeriodEnd.toISOString().slice(0, 10)}
                </span>
              </>
            ) : (
              <>
                No subscription —{" "}
                <Link href="/billing" className="link-pop">
                  see plans
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="max-w-2xl">
        <p className="eyebrow mb-3">credit_transactions</p>
        {entries.length > 0 ? (
          <LedgerTable entries={entries} />
        ) : (
          <p className="border-t-2 border-rule pt-3 text-sm">
            No ledger entries yet.
          </p>
        )}
      </section>
    </div>
  );
}
