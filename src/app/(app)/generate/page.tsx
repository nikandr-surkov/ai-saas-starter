import type { Metadata } from "next";
import Image from "next/image";
import { desc, eq } from "drizzle-orm";

import { GENERATION_COST_CREDITS } from "@/config/plans";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { GenerateForm } from "@/components/generate/generate-form";

export const metadata: Metadata = { title: "Generate" };

// The one mascot (DESIGN.md v3, optional): a coin with sunglasses for the
// empty state. Geometric, inline SVG, decorative only.
function CoinMascot() {
  return (
    <svg aria-hidden viewBox="0 0 64 64" className="size-14 shrink-0">
      <circle
        cx="32"
        cy="32"
        r="29"
        className="fill-pop-yellow stroke-foreground"
        strokeWidth="3.5"
      />
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="none"
        className="stroke-foreground"
        strokeWidth="2"
        strokeDasharray="3 5"
      />
      <rect x="15" y="24" width="13" height="8" rx="2.5" className="fill-foreground" />
      <rect x="36" y="24" width="13" height="8" rx="2.5" className="fill-foreground" />
      <path d="M28 26h8" className="stroke-foreground" strokeWidth="2.5" />
      <path
        d="M22 42q10 8 20 0"
        fill="none"
        className="stroke-foreground"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatTimestamp(date: Date): string {
  return date.toISOString().slice(0, 16).replace("T", " ");
}

export default async function GeneratePage() {
  const session = await requireSession();

  const history = await db
    .select()
    .from(generations)
    .where(eq(generations.userId, session.user.id))
    .orderBy(desc(generations.createdAt), desc(generations.id))
    .limit(20);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">AI</p>
        <h2 className="mt-1 text-xl">Generate</h2>
      </div>

      <GenerateForm
        balance={session.user.creditBalance ?? 0}
        cost={GENERATION_COST_CREDITS}
        mock={env.AI_MOCK}
      />

      <section>
        <p className="eyebrow mb-3">generations</p>
        {history.length === 0 ? (
          <div className="flex max-w-md items-start gap-4 rounded-md border-2 bg-pop-mint px-5 py-6 shadow-hard">
            <CoinMascot />
            <div>
              <p className="eyebrow">First entry pending</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Nothing generated yet — and your welcome credits are ready.
                Describe an image in the form above; the result lands here
                and the ledger records the spend.
              </p>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {history.map((generation) => (
              <li
                key={generation.id}
                className="overflow-hidden rounded-sm border"
              >
                <div className="relative aspect-square bg-secondary">
                  {generation.status === "completed" && generation.imageUrl ? (
                    <Image
                      src={generation.imageUrl}
                      alt={generation.prompt}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span
                        className={
                          generation.status === "failed"
                            ? "eyebrow text-debit-text"
                            : "eyebrow motion-safe:animate-pulse"
                        }
                      >
                        {generation.status}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-1 border-t px-2.5 py-2">
                  <p className="truncate text-sm" title={generation.prompt}>
                    {generation.prompt}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatTimestamp(generation.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
