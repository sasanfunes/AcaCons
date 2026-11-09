import { describe, expect, it } from "vitest";
import { httpsUrl } from "@/lib/validation/admin";

describe("httpsUrl", () => {
  it("acepta https y vacío", () => {
    expect(httpsUrl.safeParse("https://maps.google.com/x").success).toBe(true);
    expect(httpsUrl.safeParse("").success).toBe(true);
  });
  it("rechaza http y otros esquemas", () => {
    const r = httpsUrl.safeParse("http://ejemplo.com");
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toMatch(/https:\/\//);
    expect(httpsUrl.safeParse("javascript:alert(1)").success).toBe(false);
  });
});
