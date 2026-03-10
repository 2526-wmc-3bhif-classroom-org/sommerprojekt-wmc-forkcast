import { hashPassword, comparePassword } from "../src/utils";

describe("utils — password helpers (plain and simple)", () => {
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
