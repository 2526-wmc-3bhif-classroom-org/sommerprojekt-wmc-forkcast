import { Unit } from "../db/unit";
import { FavoriteFood } from "../types";

export class FavoriteRepository {
    private unit: Unit;

    constructor(unit: Unit) {
        this.unit = unit;
    }

    public findByUserId(userId: number): FavoriteFood[] {
        const stmt = this.unit.prepare<FavoriteFood>(
            "SELECT * FROM FavoriteFood WHERE userId = :userId", 
            { userId }
        );
        return stmt.all();
    }

    public create(userId: number, recipeId: number): FavoriteFood {
        const stmt = this.unit.prepare(
            "INSERT INTO FavoriteFood (userId, recipeId) VALUES (:userId, :recipeId) ON CONFLICT DO NOTHING",
            { userId, recipeId }
        );
        stmt.run();
        return { userId, recipeId };
    }

    public delete(userId: number, recipeId: number): boolean {
        const stmt = this.unit.prepare(
            "DELETE FROM FavoriteFood WHERE userId = :userId AND recipeId = :recipeId", 
            { userId, recipeId }
        );
        const result = stmt.run();
        return result.changes > 0;
    }
}
