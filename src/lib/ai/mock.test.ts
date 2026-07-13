import { describe, expect, it } from "vitest";

import { mockProvider } from "./mock";

describe("mock provider", () => {
  it("returns a deterministic data-URL placeholder with zero network", async () => {
    const first = await mockProvider.generateImage({
      prompt: "anything",
      userId: "user_1",
    });
    const second = await mockProvider.generateImage({
      prompt: "something else entirely",
      userId: "user_2",
    });

    expect(first).toEqual(second); // deterministic
    expect(first.url.startsWith("data:image/svg+xml;base64,")).toBe(true);
    expect(first.model).toBe("mock/placeholder");
    expect(first.width).toBe(1024);
    expect(first.height).toBe(1024);
  });
});
