import fs from "fs";
import path from "path";
import { hashPassword, comparePassword } from "../src/utils";

describe("utils — password helpers (plain and simple)", () => {
  const dbFile = path.resolve(process.cwd(), "forkcast.db");

  beforeAll(() => {
    // ensure no leftover db from other tests (harmless)
    try {
      if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
    } catch {}
  });

  it("hashPassword produces a hash and comparePassword verifies correct password", async () => {
    const pw = "geheim";
    const hashed = await hashPassword(pw);
    expect(typeof hashed).toBe("string");
    const ok = await comparePassword(pw, hashed);
    expect(ok).toBe(true);
  });

  it("comparePassword fails for wrong password", async () => {
    const pw = "geheim";
    const hashed = await hashPassword(pw);
    const ok = await comparePassword("falsch", hashed);
    expect(ok).toBe(false);
  });
});
