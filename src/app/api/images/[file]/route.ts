import { readFile } from "node:fs/promises";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { generations } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { generatedFilePath, mediaTypeByExtension } from "@/lib/ai/storage";

// Serves ./.generated images in dev (production uses public Blob URLs and
// never hits this route). Strictly validated: uuid.ext filenames only — no
// traversal — and only the generation's owner may read it.

const FILE_PATTERN =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.([a-z]{3,4})$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
): Promise<Response> {
  const { file } = await params;
  const match = FILE_PATTERN.exec(file);
  const mediaType = match?.[2] ? mediaTypeByExtension[match[2]] : undefined;
  if (!match || !match[1] || !mediaType) {
    return new Response("Not found", { status: 404 });
  }

  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const [owned] = await db
    .select({ id: generations.id })
    .from(generations)
    .where(
      and(
        eq(generations.id, match[1]),
        eq(generations.userId, session.user.id),
      ),
    )
    .limit(1);
  if (!owned) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const bytes = await readFile(generatedFilePath(file));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mediaType,
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
