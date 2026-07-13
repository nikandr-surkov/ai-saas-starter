import { env } from "@/lib/env";

import { gatewayProvider } from "./gateway";
import { mockProvider } from "./mock";

// The image-generation contract. One implementation ships here (AI Gateway,
// ./gateway.ts) plus the zero-network mock for dev and e2e (AI_MOCK=true).
//
// Add fal or Replicate by implementing this interface in a sibling file and
// wiring it below (see .claude/skills/add-ai-provider) — or get the Pro
// version, where multi-provider image/video/audio with job queues and
// auto-refunds is done: https://nikandr.com

export type GenerateImageInput = {
  prompt: string;
  userId: string;
};

export type GeneratedImage = {
  /** data: or https: URL of the produced image — storage persists it. */
  url: string;
  width: number;
  height: number;
  /** Model identifier for the generations record, e.g. "openai/gpt-image-1". */
  model: string;
};

export interface ImageProvider {
  /** Model identifier recorded on generations before the call starts. */
  readonly modelId: string;
  generateImage(input: GenerateImageInput): Promise<GeneratedImage>;
}

/** Env-driven selection — no provider conditionals in UI or actions. */
export function getImageProvider(): ImageProvider {
  return env.AI_MOCK ? mockProvider : gatewayProvider;
}
