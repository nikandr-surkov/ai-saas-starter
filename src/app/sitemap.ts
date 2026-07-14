import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

// Public pages only — the (app) group is session-gated and noindexed.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/pricing", "/login", "/signup"].map((path) => ({
    url: `${siteConfig.url}${path === "/" ? "" : path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
