import { Recipe } from '../types';
import { Unit } from "../db/unit";
import { CACHE_TTL_MS } from "../app";

export class LocalRecipeRepository {
    async searchRecipes(query: string): Promise<Recipe[]> {
        const unit = new Unit(true);
        // exclude recipes older than configured TTL
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
        const stmt = unit.prepare<Recipe>("SELECT id, name, image FROM Recipe WHERE name LIKE :query AND updatedAt > :cutoff", {
            query: `%${query}%`,
            cutoff
        });
        const recipes = stmt.all();
        unit.complete();
        return recipes;
    }

    async saveRecipe(recipe: Recipe): Promise<void> {
        const unit = new Unit(false);
        const now = new Date().toISOString();
        // upsert to update timestamp
        const stmt = unit.prepare<void>(`
            INSERT INTO Recipe (id, name, image, updatedAt) VALUES (:id, :name, :image, :updatedAt)
            ON CONFLICT(id) DO UPDATE SET
                updatedAt = excluded.updatedAt,
                name = excluded.name,
                image = excluded.image
        `, {
            id: recipe.id,
            name: recipe.name,
            image: recipe.image,
            updatedAt: now
        });
        stmt.run();
        unit.complete(true);
    }

    async findRecipeById(id: number): Promise<Recipe | undefined> {
        const unit = new Unit(true);
        // check expiry
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
        const stmt = unit.prepare<Recipe>("SELECT id, name, image FROM Recipe WHERE id = :id AND updatedAt > :cutoff", {
            id,
            cutoff
        });
        const recipe = stmt.get();
        unit.complete();
        return recipe;
    }

    async removeExpiredRecipes(): Promise<void> {
        const unit = new Unit(false);
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
        const stmt = unit.prepare<void>("DELETE FROM Recipe WHERE updatedAt <= :cutoff", { cutoff });
        stmt.run();
        unit.complete(true);
    }
}
