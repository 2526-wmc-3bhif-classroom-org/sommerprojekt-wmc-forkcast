import fs from "fs";
import path from "path";
import os from "os";
import { Unit } from "../src/db/unit";
import { UserRepository } from "../src/repository/userRepository";
import { User } from "../src/types";

describe("UserRepository — integration with Unit", () => {
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

  it("create() and findByEmail() should work together", () => {
    const unit = new Unit(false);
    const repo = new UserRepository(unit);

    const userToCreate: Omit<User, "id"> = {
      name: "bob",
      email: "b@b.com",
      password: "pw-hash",
      profilePicture: "pic.jpg"
    };

    // Create user
    const createdUser = repo.create(userToCreate);
    expect(createdUser).toBeDefined();
    expect(createdUser.id).toBeGreaterThan(0);
    expect(createdUser.name).toBe("bob");
    expect(createdUser.email).toBe("b@b.com");

    // Find user
    const foundUser = repo.findByEmail("b@b.com");
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(createdUser.id);
    expect(foundUser?.name).toBe("bob");

    unit.complete(true);
  });

  it("findByEmail() should return undefined if user is not found", () => {
    const unit = new Unit(true); // Read-only is fine for this test
    const repo = new UserRepository(unit);

    const user = repo.findByEmail("noone@nowhere.com");
    expect(user).toBeUndefined();

    unit.complete();
  });
});
