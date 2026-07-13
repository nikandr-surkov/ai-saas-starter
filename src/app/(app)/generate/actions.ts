"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { GENERATION_COST_CREDITS } from "@/config/plans";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { getImageProvider } from "@/lib/ai/provider";
import { storeGeneratedImage } from "@/lib/ai/storage";
import { requireSession } from "@/lib/auth/session";
import {
  InsufficientCreditsError,
  refundCredits,
  spendCredits,
} from "@/lib/credits";
import { limitGeneration } from "@/lib/rate-limit";

const promptSchema = z
  .string()
  .trim()
  .min(3, "Prompt must be at least 3 characters")
  .max(1000, "Prompt must be at most 1000 characters");

export type GenerateResult = {
  ok: boolean;
  error?:
    | "invalid_prompt"
    | "rate_limited"
    | "insufficient_credits"
    | "generation_failed";
};

// Money-flow order (F4): create the generation record FIRST so the spend
// ref exists before money moves — no orphaned spends. Spend BEFORE the
// provider call; refund on any failure after the spend. Both credit
// mutations are idempotent on the generation id.
//
// (prevState, formData) signature: passed to useActionState directly, so
// the form keeps working before hydration (progressive enhancement).
export async function generateImageAction(
  _prevState: GenerateResult,
  formData: FormData,
): Promise<GenerateResult> {
  const session = await requireSession();

  const parsed = promptSchema.safeParse(formData.get("prompt"));
  if (!parsed.success) {
    return { ok: false, error: "invalid_prompt" };
  }

  const limit = await limitGeneration(session.user.id);
  if (!limit.success) {
    return { ok: false, error: "rate_limited" };
  }

  const provider = getImageProvider();
  const [generation] = await db
    .insert(generations)
    .values({
      userId: session.user.id,
      prompt: parsed.data,
      model: provider.modelId,
    })
    .returning({ id: generations.id });
  if (!generation) {
    throw new Error("generate: failed to create the generation record");
  }
  const ref = { type: "generation", id: generation.id };

  try {
    await spendCredits({
      userId: session.user.id,
      amount: GENERATION_COST_CREDITS,
      ref,
    });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      // No money moved — remove the never-started record entirely so
      // nothing is left pending. (generations is not the ledger; deletes
      // are fine here.)
      await db.delete(generations).where(eq(generations.id, generation.id));
      return { ok: false, error: "insufficient_credits" };
    }
    // Unknown failure: the spend may have committed even though we saw an
    // error (lost commit-ack). Keep the pending row — a pending record with
    // a spend_{id} and no refund_{id} is the detectable reconciliation
    // signal; deleting it would orphan the charge.
    throw error;
  }

  try {
    const image = await provider.generateImage({
      prompt: parsed.data,
      userId: session.user.id,
    });
    const storedUrl = await storeGeneratedImage({
      generationId: generation.id,
      url: image.url,
    });
    await db
      .update(generations)
      .set({ imageUrl: storedUrl, status: "completed", model: image.model })
      .where(eq(generations.id, generation.id));
  } catch (error) {
    console.error(
      "[generate] provider/storage failed:",
      error instanceof Error ? error.message : error,
    );
    try {
      await refundCredits({ userId: session.user.id, ref });
    } catch (refundError) {
      // Do NOT tell the user they were refunded — they weren't. Mark the
      // row failed so nothing dangles as pending, log the reconciliation
      // signal, and surface a real error. refundCredits is idempotent, so
      // a retry heals this.
      console.error(
        `[generate] REFUND FAILED for generation ${generation.id} — spend_${generation.id} has no matching refund; manual reconciliation or retry needed:`,
        refundError instanceof Error ? refundError.message : refundError,
      );
      await db
        .update(generations)
        .set({ status: "failed" })
        .where(eq(generations.id, generation.id));
      throw refundError;
    }
    await db
      .update(generations)
      .set({ status: "failed" })
      .where(eq(generations.id, generation.id));
    revalidatePath("/generate");
    return { ok: false, error: "generation_failed" };
  }

  revalidatePath("/generate");
  return { ok: true };
}
