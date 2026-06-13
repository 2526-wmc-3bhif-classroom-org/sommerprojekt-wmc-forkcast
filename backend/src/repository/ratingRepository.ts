import { Unit } from "../db/unit";

export interface RatingAggregate {
    average: number;
    count: number;
}

export class RatingRepository {
    private unit: Unit;

    constructor(unit: Unit) {
        this.unit = unit;
    }

    public upsert(userId: number, recipeId: number, rating: number): void {
        const stmt = this.unit.prepare(
            `INSERT INTO RecipeRating (userId, recipeId, rating) VALUES (:userId, :recipeId, :rating)
             ON CONFLICT (userId, recipeId) DO UPDATE SET rating = excluded.rating, createdAt = datetime('now')`,
            { userId, recipeId, rating }
        );
        stmt.run();
    }

    public getUserRating(userId: number, recipeId: number): number | undefined {
        const stmt = this.unit.prepare<{ rating: number }>(
            "SELECT rating FROM RecipeRating WHERE userId = :userId AND recipeId = :recipeId",
            { userId, recipeId }
        );
        const result = stmt.get();
        return result?.rating;
    }

    public getAggregate(recipeId: number): RatingAggregate {
        const stmt = this.unit.prepare<{ average: number | null; count: number }>(
            "SELECT AVG(rating) AS average, COUNT(*) AS count FROM RecipeRating WHERE recipeId = :recipeId",
            { recipeId }
        );
        const result = stmt.get();
        return { average: result?.average ?? 0, count: result?.count ?? 0 };
    }

    public getAggregatesForIds(recipeIds: number[]): Map<number, RatingAggregate> {
        if (recipeIds.length === 0) return new Map();
        const placeholders = recipeIds.map((_, i) => `:id${i}`).join(', ');
        const params: Record<string, any> = {};
        recipeIds.forEach((id, i) => { params[`id${i}`] = id; });
        const rows = this.unit.prepare<{ recipeId: number; average: number; count: number }>(
            `SELECT recipeId, AVG(rating) AS average, COUNT(*) AS count
             FROM RecipeRating WHERE recipeId IN (${placeholders}) GROUP BY recipeId`,
            params
        ).all();
        return new Map(rows.map(r => [r.recipeId, { average: r.average, count: r.count }]));
    }

    public getUserRatingsForIds(userId: number, recipeIds: number[]): Map<number, number> {
        if (recipeIds.length === 0) return new Map();
        const placeholders = recipeIds.map((_, i) => `:id${i}`).join(', ');
        const params: Record<string, any> = { userId };
        recipeIds.forEach((id, i) => { params[`id${i}`] = id; });
        const rows = this.unit.prepare<{ recipeId: number; rating: number }>(
            `SELECT recipeId, rating FROM RecipeRating WHERE userId = :userId AND recipeId IN (${placeholders})`,
            params
        ).all();
        return new Map(rows.map(r => [r.recipeId, r.rating]));
    }
}
