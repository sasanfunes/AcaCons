import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { DbDriver } from "@/lib/storage/drivers";
import { resetDb } from "./helpers";

async function readAll(stream: ReadableStream<Uint8Array>) {
  const chunks: Uint8Array[] = [];
  for await (const c of stream as unknown as AsyncIterable<Uint8Array>) chunks.push(c);
  return Buffer.concat(chunks);
}

describe("DbDriver", () => {
  beforeEach(resetDb);
  const driver = new DbDriver(db);

  it("guarda, lee, reemplaza y borra", async () => {
    await driver.put("brands/x/logo.svg", new TextEncoder().encode("<svg/>"), "image/svg+xml");
    const f = await driver.get("brands/x/logo.svg");
    expect(f?.size).toBe(6);
    expect((await readAll(f!.stream)).toString()).toBe("<svg/>");

    await driver.put("brands/x/logo.svg", new TextEncoder().encode("<svg>2</svg>"), "image/svg+xml");
    expect((await readAll((await driver.get("brands/x/logo.svg"))!.stream)).toString()).toBe("<svg>2</svg>");

    await driver.delete("brands/x/logo.svg");
    expect(await driver.get("brands/x/logo.svg")).toBeNull();
  });

  it("rechaza claves inseguras", async () => {
    await expect(driver.put("../etc/passwd", new Uint8Array([1]), "text/plain")).rejects.toThrow(/inválida/);
  });
});
