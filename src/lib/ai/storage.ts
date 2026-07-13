import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { put } from "@vercel/blob";

import { env, features } from "@/lib/env";

// Persists a generated image and returns the durable URL for the
// generations record. Vercel Blob in production; without a token, files go
// to ./.generated and are served by /api/images/[id] — dev only (AGENTS.md
// gotchas).

const GENERATED_DIR = path.join(process.cwd(), ".generated");

const extensionByMediaType: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

async function decodeImageUrl(
  url: string,
): Promise<{ bytes: Buffer; mediaType: string }> {
  if (url.startsWith("data:")) {
    const match = /^data:([^;,]+);base64,(.+)$/.exec(url);
    if (!match || !match[1] || !match[2]) {
      throw new Error("storage: malformed data URL from provider");
    }
    return { bytes: Buffer.from(match[2], "base64"), mediaType: match[1] };
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `storage: fetching provider image failed (${response.status})`,
    );
  }
  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    mediaType: response.headers.get("content-type") ?? "image/png",
  };
}

export async function storeGeneratedImage({
  generationId,
  url,
}: {
  generationId: string;
  url: string;
}): Promise<string> {
  const { bytes, mediaType } = await decodeImageUrl(url);
  const extension = extensionByMediaType[mediaType] ?? "png";

  if (features.blobStorage) {
    const blob = await put(`generations/${generationId}.${extension}`, bytes, {
      access: "public",
      contentType: mediaType,
      token: env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  await mkdir(GENERATED_DIR, { recursive: true });
  await writeFile(
    path.join(GENERATED_DIR, `${generationId}.${extension}`),
    bytes,
  );
  return `/api/images/${generationId}.${extension}`;
}

/** Dev-serving helper for /api/images — resolves inside ./.generated only. */
export function generatedFilePath(fileName: string): string {
  return path.join(GENERATED_DIR, fileName);
}

export const mediaTypeByExtension: Record<string, string> = Object.fromEntries(
  Object.entries(extensionByMediaType).map(([type, ext]) => [ext, type]),
);
