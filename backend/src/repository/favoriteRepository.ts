import { Unit } from "../db/unit";
import { FavoriteFood } from "../types";

export class FavoriteRepository {
    private unit: Unit;

    constructor(unit: Unit) {
        this.unit = unit;
    }

    public findByUserId(userId: number, offset?: number, limit?: number): FavoriteFood[] {
        let query = "SELECT * FROM FavoriteFood WHERE userId = :userId";
        const params: any = { userId };
        
        if (offset !== undefined && offset > 0) {
            query += " LIMIT :limit OFFSET :offset";
            params.offset = offset;
            params.limit = limit ?? -1;
        } else if (limit !== undefined && limit > 0) {
            query += " LIMIT :limit";
            params.limit = limit;
        }
        
        const stmt = this.unit.prepare<FavoriteFood>(query, params);
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

    public findFavoritedRecipeIds(userId: number, recipeIds: number[]): Set<number> {
        if (recipeIds.length === 0) return new Set();
        const placeholders = recipeIds.map((_, i) => `:id${i}`).join(', ');
        const params: Record<string, any> = { userId };
        recipeIds.forEach((id, i) => { params[`id${i}`] = id; });
        const rows = this.unit.prepare<{ recipeId: number }>(
            `SELECT recipeId FROM FavoriteFood WHERE userId = :userId AND recipeId IN (${placeholders})`,
            params
        ).all();
        return new Set(rows.map(r => r.recipeId));
    }
}
