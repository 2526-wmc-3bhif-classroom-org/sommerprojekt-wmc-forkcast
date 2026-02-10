import fs from "fs";
import path from "path";
import os from "os";
import { Unit } from "../src/db/unit";
import { UserRepository } from "../src/repository/userRepository";

describe("UserRepository — integration with Unit (simple)", () => {
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

  it("createAccount + exists + findByUsername (happy path)", () => {
    const unit = new Unit(false);
    const repo = new UserRepository(unit);

    repo.createAccount("bob", "b@b", "pw-hash");
    expect(repo.exists("bob")).toBe(true);

    const user = repo.findByUsername("bob");
    expect(user).toBeDefined();
    expect(user?.username).toBe("bob");

    unit.complete(true);
  });

  it("exists return false if user missing and findByUsername returns undefined", () => {
    const unit = new Unit(true);
    const repo = new UserRepository(unit);
    expect(repo.exists("noone")).toBe(false);
    expect(repo.findByUsername("noone")).toBeUndefined();
    unit.complete();
  });
});
