"use client";

import * as React from "react";

import Link from "next/link";
import { toast } from "sonner";

import {
  generateImageAction,
  type GenerateResult,
} from "@/app/(app)/generate/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: GenerateResult = { ok: true };

const errorMessages: Record<NonNullable<GenerateResult["error"]>, string> = {
  invalid_prompt: "Prompt must be 3–1000 characters",
  rate_limited: "Rate limit reached — try again in a minute",
  insufficient_credits: "Not enough credits — top up in Billing",
  generation_failed: "Generation failed — credit refunded",
};

export function GenerateForm({
  balance,
  cost,
}: {
  balance: number;
  cost: number;
}) {
  const formRef = React.useRef<HTMLFormElement>(null);
  // The server action goes to useActionState directly, keeping the form
  // functional before hydration. Every invocation returns a fresh object,
  // so the effect below fires once per submission.
  const [state, formAction, pending] = React.useActionState(
    generateImageAction,
    initialState,
  );

  React.useEffect(() => {
    if (state === initialState) return;
    if (state.error) {
      toast.error(errorMessages[state.error]);
      return;
    }
    toast.success(`Image generated — ${cost} credit spent`);
    formRef.current?.reset();
  }, [state, cost]);

  const outOfCredits = balance < cost;

  return (
    <form ref={formRef} action={formAction} className="grid max-w-xl gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="generate-prompt">Prompt</Label>
        <Textarea
          id="generate-prompt"
          name="prompt"
          placeholder="A ledger book on a desk, studio light"
          minLength={3}
          maxLength={1000}
          required
          disabled={pending}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || outOfCredits}>
          {pending ? "Generating" : `Generate — ${cost} credit`}
        </Button>
        {outOfCredits ? (
          <p className="text-sm text-muted-foreground">
            Out of credits —{" "}
            <Link
              href="/billing"
              className="text-primary underline underline-offset-4"
            >
              top up in Billing
            </Link>
          </p>
        ) : null}
      </div>
    </form>
  );
}
