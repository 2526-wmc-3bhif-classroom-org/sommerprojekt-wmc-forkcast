import fs from "fs";
import path from "path";
import os from "os";
import { Unit, __test_logStatement } from "../src/db/unit";

describe("Unit (DB) — simple, direct tests", () => {
  const dbFile = path.resolve(process.cwd(), "forkcast.db");
  let origCwd: string;
  let tmpDir: string;

  beforeEach(() => {
    origCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "forkcast-test-"));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    try {
      process.chdir(origCwd);
      if (fs.existsSync(path.join(tmpDir, "forkcast.db"))) fs.unlinkSync(path.join(tmpDir, "forkcast.db"));
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  });

  it("prepare + run + getLastRowId (insert) returns an id", () => {
    const unit = new Unit(false);
    const stmt = unit.prepare<{ id: number }, { username: string }>(
      "INSERT INTO user (username, email, password) VALUES (@username, 'a@b', 'x')",
      { username: "u1" }
    );
    const res = stmt.run();
    expect(res).toBeDefined();

    const id = unit.getLastRowId();
    expect(typeof id).toBe("number");
    expect(id).toBeGreaterThan(0);

    // commit should succeed when explicit
    unit.complete(true);
  });

  it("getLastRowId throws when internal result is undefined (simple spy)", () => {
    const unit = new Unit(true);
    const spy = jest.spyOn(unit, "prepare").mockReturnValue({ get: () => undefined, all: () => [], run: () => ({}) } as any);
    expect(() => unit.getLastRowId()).toThrow(/Unable to retrieve last inserted row id/);
    spy.mockRestore();
    unit.complete();
  });

  it("complete throws when transaction is open and no commit/rollback provided (non-readonly)", () => {
    const unit = new Unit(false);
    expect(() => unit.complete()).toThrow(/requires information/);
    // ensure cleanup doesn't throw second time
    expect(() => unit.complete(false)).not.toThrow();
  });

  it("__test_logStatement: log branch and ignore branch", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});

    // should be ignored (starts with pragma)
    __test_logStatement("pragma something");
    expect(spy).not.toHaveBeenCalled();

    // normal SQL should be logged
    __test_logStatement("SELECT * FROM user WHERE id = 1");
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it("__test_logStatement: ignores 'create' statements", () => {
    const spy2 = jest.spyOn(console, "log").mockImplementation(() => {});
    __test_logStatement("create table something");
    expect(spy2).not.toHaveBeenCalled();
    spy2.mockRestore();
  });

  it("__test_logStatement: ignores non-string input", () => {
    const spy3 = jest.spyOn(console, "log").mockImplementation(() => {});
    __test_logStatement({ not: "a string" });
    expect(spy3).not.toHaveBeenCalled();
    spy3.mockRestore();
  });
});
