import fs from "fs";
import path from "path";
import os from "os";
import { UserService } from "../src/service/userService";

describe("UserService — simple end-to-end-like tests", () => {
  const dbFile = path.resolve(process.cwd(), "forkcast.db");
  const svc = new UserService();
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

  it("createAccount creates an account and loginAccount returns true for correct password", async () => {
    await svc.createAccount("alice", "a@a", "topsecret");
    const ok = await svc.loginAccount("alice", "topsecret");
    expect(ok).toBe(true);
  });

  it("createAccount throws on duplicate username (short and clear)", async () => {
    await svc.createAccount("tom", "t@t", "pw");
    await expect(svc.createAccount("tom", "t2@t", "pw")).rejects.toThrow(/already taken/);
  });

  it("loginAccount returns false for unknown user or wrong password", async () => {
    const unknown = await svc.loginAccount("nobody", "x");
    expect(unknown).toBe(false);

    await svc.createAccount("max", "m@m", "pw1");
    const wrong = await svc.loginAccount("max", "wrong");
    expect(wrong).toBe(false);
  });
});
