"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { SparkleSpinner } from "@/components/sparkle-spinner";
import { Button } from "@/components/ui/button";

type BusyProps = React.ComponentProps<typeof Button> & { busyLabel: string };

// v4.5 busy state (DESIGN.md app register): the label swaps and the
// sparkle spins — one pattern for every submitting button in the app.
export function BusyButton({
  busy,
  busyLabel,
  children,
  disabled,
  ...props
}: BusyProps & { busy: boolean }) {
  return (
    <Button {...props} disabled={busy || disabled}>
      {busy ? (
        <>
          <SparkleSpinner />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

// For <form action={serverAction}> forms: reads pending state from the
// surrounding form via useFormStatus.
export function SubmitButton({ busyLabel, children, ...props }: BusyProps) {
  const { pending } = useFormStatus();
  return (
    <BusyButton busy={pending} busyLabel={busyLabel} type="submit" {...props}>
      {children}
    </BusyButton>
  );
}
