import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";

import { plans } from "@/config/plans";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { planByPriceId } from "@/lib/billing/plans";
import { getHistory } from "@/lib/credits";
import { LedgerTable, type LedgerEntry } from "@/components/ledger-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard — ai-saas-starter" };

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

  const [history, [sub]] = await Promise.all([
    getHistory(session.user.id, 10),
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1),
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

      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="eyebrow">Credits</p>
            <CardTitle className="font-mono text-2xl">
              {session.user.creditBalance}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Link
              href="/billing"
              className="text-primary underline underline-offset-4"
            >
              Buy more
            </Link>{" "}
            or{" "}
            <Link
              href="/generate"
              className="text-primary underline underline-offset-4"
            >
              generate an image
            </Link>
            .
          </CardContent>
        </Card>
        <Card>
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
                  className="text-primary underline underline-offset-4"
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
