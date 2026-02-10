import { Unit } from "../db/unit";

export class AccountRepository {
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
            "SELECT * FROM user WHERE username = @username",
            { username }
        );

        const row = stmt.get();
        return !!row;
    }
}
