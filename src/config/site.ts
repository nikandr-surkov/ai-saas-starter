// Site-wide constants. The GitHub link renders without a live star count
// until the repo is public — fetching the real count is an M7 README-polish
// task.
export const siteConfig = {
  name: "ai-saas-starter",
  description:
    "Open-source SaaS foundation: auth, Stripe subscriptions, and a credits ledger that survives webhook retries.",
  github: "https://github.com/nikandr-surkov/ai-saas-starter",
  /** The paid multi-provider version. One link, no upsell copy. */
  pro: "https://nikandr.com",
} as const;
