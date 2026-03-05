import { Unit } from "../db/unit";
import { User } from "../types";

export class UserRepository {
    private unit: Unit;

    constructor(unit: Unit) {
        this.unit = unit;
    }

    public findByEmail(email: string): User | undefined {
        const stmt = this.unit.prepare<User>("SELECT * FROM User WHERE email = :email",
            { email: email });
        return stmt.get();
    }

    public create(user: Omit<User, "id">): User {
        const stmt = this.unit.prepare(
            "INSERT INTO User (name, email, password, profilePicture) VALUES (:name, :email, :password, :profilePicture)",
            {
                name: user.name,
                email: user.email,
                password: user.password,
                profilePicture: user.profilePicture || null
            });
        stmt.run();
        const newUser = this.findByEmail(user.email);
        if (!newUser) {
            throw new Error("Failed to create user");
        }
        return newUser;
    }
}
