import fs from "fs";
import path from "path";
import os from "os";
import { AuthService } from "../src/service/authService";
import { Unit } from "../src/db/unit";
import jwt from "jsonwebtoken";
import { Response } from "express"; // Import Response

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";

describe("AuthService — JWT Workflow Tests", () => {
    let tmpDir: string;
    let originalCwd: string;

    beforeEach(() => {
        originalCwd = process.cwd();
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "forkcast-test-"));
        process.chdir(tmpDir);
    });

    afterEach(() => {
        try {
            process.chdir(originalCwd);
            fs.rmSync(tmpDir, { recursive: true, force: true });
        } catch (e) {
            console.error("Cleanup error:", e);
        }
    });

    it("should register a new user successfully", async () => {
        const unit = new Unit(false);
        const authService = new AuthService(unit);

        const user = await authService.register("Alice", "alice@example.com", "password123");
        unit.complete(true);

        expect(user).toHaveProperty("id");
        expect(user.name).toBe("Alice");
        expect(user.email).toBe("alice@example.com");
        expect(user).not.toHaveProperty("password");
    });

    it("should fail to register a user with an existing email", async () => {
        const unit1 = new Unit(false);
        const authService1 = new AuthService(unit1);
        await authService1.register("Bob", "bob@example.com", "password123");
        unit1.complete(true);

        const unit2 = new Unit(false);
        const authService2 = new AuthService(unit2);
        await expect(authService2.register("Bob2", "bob@example.com", "password456"))
            .rejects.toThrow("User with this email already exists");
        unit2.complete(false);
    });

    it("should login successfully and return a JWT token", async () => {
        // Register first
        const unit1 = new Unit(false);
        const authService1 = new AuthService(unit1);
        await authService1.register("Charlie", "charlie@example.com", "password123");
        await authService1.verifyUser("charlie@example.com");
        unit1.complete(true);

        // Login
        const unit2 = new Unit(false);
        const authService2 = new AuthService(unit2);
        const result = await authService2.login("charlie@example.com", "password123");
        unit2.complete(true);

        expect(result).toHaveProperty("user");
        expect(result).toHaveProperty("token");
        expect(typeof result.token).toBe("string");

        const loggedInUser = result.user;
        expect(loggedInUser).toHaveProperty("id");
        expect(loggedInUser.name).toBe("Charlie");
        expect(loggedInUser.email).toBe("charlie@example.com");
        expect(loggedInUser).not.toHaveProperty("password");
    });

    it("should fail to login with incorrect password", async () => {
        // Register first
        const unit1 = new Unit(false);
        const authService1 = new AuthService(unit1);
        await authService1.register("Dave", "dave@example.com", "password123");
        unit1.complete(true);

        // Login with wrong password
        const unit2 = new Unit(false);
        const authService2 = new AuthService(unit2);
        await expect(authService2.login("dave@example.com", "wrongpassword"))
            .rejects.toThrow("Invalid credentials");
        unit2.complete(false);
    });

    it("should fail to login with non-existent email", async () => {
        const unit = new Unit(false);
        const authService = new AuthService(unit);
        await expect(authService.login("nonexistent@example.com", "password123"))
            .rejects.toThrow("Invalid credentials");
        unit.complete(false);
    });
});
