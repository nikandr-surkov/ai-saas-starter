import { Button } from "@react-email/components";

import { emailTheme } from "./layout";

/** The one green accent per email — the action link. */
export function EmailButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: emailTheme.accent,
        color: emailTheme.accentInk,
        border: `2px solid ${emailTheme.ink}`,
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 600,
        padding: "11px 22px",
        margin: "10px 0",
      }}
    >
      {children}
    </Button>
  );
}
