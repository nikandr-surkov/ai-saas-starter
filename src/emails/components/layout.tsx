import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// Shared chrome for every transactional email: mono wordmark header, ink
// text on paper, one green accent (DESIGN.md, translated to email-safe hex —
// oklch doesn't survive email clients). Font stacks instead of webfonts.

// v3 playful palette in email-safe hex: warm cream, near-black ink, yellow
// action button with ink text, credit green for amounts, 2px ink borders.
export const emailTheme = {
  paper: "#f7f2df",
  paper2: "#ece5cf",
  ink: "#26241d",
  muted: "#6e6a5c",
  hairline: "#cfc8b2",
  accent: "#f3d84a",
  accentInk: "#26241d",
  credit: "#27a562",
  mono: "'Courier New', Courier, monospace",
  sans: "Helvetica, Arial, sans-serif",
} as const;

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: emailTheme.paper2,
          fontFamily: emailTheme.sans,
          color: emailTheme.ink,
          margin: 0,
          padding: "24px 12px",
        }}
      >
        <Container
          style={{
            backgroundColor: emailTheme.paper,
            border: `2px solid ${emailTheme.ink}`,
            borderRadius: 6,
            maxWidth: 520,
            padding: "0 32px 28px",
          }}
        >
          <Section style={{ borderBottom: `2px solid ${emailTheme.ink}` }}>
            <Text
              style={{
                fontFamily: emailTheme.mono,
                fontSize: 13,
                letterSpacing: "0.04em",
                margin: "18px 0 14px",
              }}
            >
              <span style={{ color: emailTheme.accent }}>▮</span>{" "}
              ai-saas-starter
            </Text>
          </Section>
          {children}
          <Hr
            style={{
              borderColor: emailTheme.hairline,
              margin: "28px 0 14px",
            }}
          />
          <Text
            style={{
              fontFamily: emailTheme.mono,
              fontSize: 10,
              letterSpacing: "0.06em",
              color: emailTheme.muted,
              margin: 0,
            }}
          >
            ai-saas-starter · open source · MIT
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 20,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        margin: "24px 0 8px",
      }}
    >
      {children}
    </Text>
  );
}

export function EmailText({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 14.5, lineHeight: "24px", margin: "8px 0" }}>
      {children}
    </Text>
  );
}

export function EmailMuted({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 13,
        lineHeight: "21px",
        color: emailTheme.muted,
        margin: "8px 0 0",
      }}
    >
      {children}
    </Text>
  );
}
