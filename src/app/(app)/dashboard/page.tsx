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
      <div>
        <p className="eyebrow">Overview</p>
        <h2 className="mt-1 text-xl">Dashboard</h2>
      </div>

      {features.email && !session.user.emailVerified ? (
        <div className="max-w-2xl rounded-md border-2 border-l-[6px] border-l-pop-orange px-5 py-4">
          <p className="eyebrow">Verify your email</p>
          <p className="mt-1 text-sm text-muted-foreground">
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
            <p className="mt-1 text-sm text-muted-foreground">
              Your welcome credits are on the books. Head to{" "}
              <Link
                href="/generate"
                className="text-primary-text underline underline-offset-4"
              >
                Generate
              </Link>{" "}
              to spend the first one — each image costs 1 credit and failed
              generations refund themselves. Plans and top-ups live in{" "}
              <Link
                href="/billing"
                className="text-primary-text underline underline-offset-4"
              >
                Billing
              </Link>
              .
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Card className="border-l-[6px] border-l-pop-yellow">
          <CardHeader>
            <p className="eyebrow">Credits</p>
            <CardTitle>
              <CountUpDigits value={session.user.creditBalance ?? 0} />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Link
              href="/billing"
              className="text-primary-text underline underline-offset-4"
            >
              Buy more
            </Link>{" "}
            or{" "}
            <Link
              href="/generate"
              className="text-primary-text underline underline-offset-4"
            >
              generate an image
            </Link>
            .
          </CardContent>
        </Card>
        <Card className="border-l-[6px] border-l-pop-mint">
          <CardHeader>
            <p className="eyebrow">Plan</p>
            <CardTitle>{currentPlan.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
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
                <Link
                  href="/billing"
                  className="text-primary-text underline underline-offset-4"
                >
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
          <p className="border-t-2 border-rule pt-3 text-sm text-muted-foreground">
            No ledger entries yet.
          </p>
        )}
      </section>
    </div>
  );
}
