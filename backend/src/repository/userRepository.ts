import { Unit } from "../db/unit";
import { User } from "../types";

export class UserRepository {
    constructor(private unit: Unit) {}

    public createAccount(username: string, email: string, passwordHash: string): void {
        const stmt = this.unit.prepare(
            "INSERT INTO user (username, email, password) VALUES (@username, @email, @password)",
            { username, email, password: passwordHash }
        );
        stmt.run();
    }

    public exists(username: string): boolean {
        const stmt = this.unit.prepare(
            "SELECT 1 FROM user WHERE username = @username",
            { username }
        );
        const row = stmt.get();
        return !!row;
    }

    public findByUsername(username: string): User | undefined {
        const stmt = this.unit.prepare(
            "SELECT * FROM user WHERE username = @username",
            { username }
        );
        return stmt.get() as User | undefined;
    }
}
