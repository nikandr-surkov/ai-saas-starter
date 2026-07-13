import type { ImageProvider } from "./provider";

// Deterministic placeholder — zero network calls, zero cost. Drives free
// local dev and the Playwright e2e suite (AI_MOCK=true). Never enable the
// flag in production.

const WIDTH = 1024;
const HEIGHT = 1024;

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"><rect width="${WIDTH}" height="${HEIGHT}" fill="oklch(0.965 0.004 95)"/><rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}" fill="none" stroke="oklch(0.21 0.012 145)" stroke-opacity="0.28" stroke-width="2"/><text x="50%" y="50%" text-anchor="middle" font-family="monospace" font-size="40" fill="oklch(0.5 0.015 145)">AI_MOCK=true</text></svg>`;

const placeholderDataUrl = `data:image/svg+xml;base64,${Buffer.from(placeholderSvg).toString("base64")}`;

export const mockProvider: ImageProvider = {
  modelId: "mock/placeholder",
  async generateImage() {
    return {
      url: placeholderDataUrl,
      width: WIDTH,
      height: HEIGHT,
      model: "mock/placeholder",
    };
  },
};
