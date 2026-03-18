import { Unit } from "../db/unit";
import { User } from "../types";

export class UserRepository {
    private unit: Unit;

    constructor(unit: Unit) {
        this.unit = unit;
    }

    public findById(id: number): User | undefined {
        const stmt = this.unit.prepare<User>("SELECT * FROM User WHERE id = :id",
            { id });
        return stmt.get();
    }

    public findByIdentifier(identifier: string): User | undefined {
        const stmt = this.unit.prepare<User>("SELECT * FROM User WHERE email = :identifier OR name = :identifier", { identifier: identifier });
        return stmt.get();
    }

    public findByEmail(email: string): User | undefined {
        const stmt = this.unit.prepare<User>("SELECT * FROM User WHERE email = :email",
            { email: email });
        return stmt.get();
    }

    public create(user: Omit<User, "id">): User {
        const stmt = this.unit.prepare(
            "INSERT INTO User (name, email, password, profilePicture, isVerified) VALUES (:name, :email, :password, :profilePicture, :isVerified)",
            {
                name: user.name,
                email: user.email,
                password: user.password,
                profilePicture: user.profilePicture || null,
                isVerified: user.isVerified ? 1 : 0
            });
        stmt.run();
        const newUser = this.findByEmail(user.email);
        if (!newUser) {
            throw new Error("Failed to create user");
        }
        return newUser;
    }
    
    public updateVerificationStatus(email: string, isVerified: boolean): void {
        const stmt = this.unit.prepare(
            "UPDATE User SET isVerified = :isVerified WHERE email = :email",
            {
                isVerified: isVerified ? 1 : 0,
                email: email
            });
        const result = stmt.run();
        if (result.changes === 0) {
            throw new Error("User not found to update verification status");
        }
    }
}
