import { Unit } from "../db/unit";
import { Friend } from "../types";

export class FriendRepository {
    private unit: Unit;

    constructor(unit: Unit) {
        this.unit = unit;
    }

    public findByUserId(userId: number): Friend[] {
        const stmt = this.unit.prepare<Friend>(
            "SELECT * FROM Friend WHERE userId = :userId",
            { userId }
        );
        return stmt.all();
    }

    public create(userId: number, friendId: number): Friend {
        const stmt = this.unit.prepare(
            "INSERT INTO Friend (userId, friendId) VALUES (:userId, :friendId) ON CONFLICT DO NOTHING",
            { userId, friendId }
        );
        stmt.run();
        return { userId, friendId };
    }

    public delete(userId: number, friendId: number): boolean {
        const stmt = this.unit.prepare(
            "DELETE FROM Friend WHERE userId = :userId AND friendId = :friendId",
            { userId, friendId }
        );
        const result = stmt.run();
        return result.changes > 0;
    }
}
