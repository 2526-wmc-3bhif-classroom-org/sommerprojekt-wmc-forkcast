import { Recipe, RecipeDetails, RecipeWithDetails } from '../types';
import { Unit } from "../db/unit";
import { CACHE_TTL_MS } from "../app";

export class LocalRecipeRepository {
    async searchRecipes(query: string): Promise<RecipeWithDetails[]> {
        const unit = new Unit(true);
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
        const stmt = unit.prepare<RecipeWithDetails>(`
            SELECT r.id, r.name, r.image,
                   d.readyInMinutes, d.servings, d.stepCount, d.ingredientCount, d.pricePerServing,
                   d.effortScore, d.rating, d.aggregateLikes,
                   d.vegetarian, d.vegan, d.glutenFree, d.dairyFree
            FROM Recipe r
            INNER JOIN RecipeDetails d ON d.recipeId = r.id
            WHERE r.name LIKE :query AND r.updatedAt > :cutoff
        `, { query: `%${query}%`, cutoff });
        const recipes = stmt.all();
        unit.complete();
        return recipes;
    }

    async saveRecipesWithDetails(entries: Array<{ recipe: Recipe; details: Omit<RecipeDetails, 'recipeId'> }>): Promise<void> {
        if (entries.length === 0) return;
        const unit = new Unit(false);
        const now = new Date().toISOString();
        for (const { recipe, details } of entries) {
            unit.prepare<void>(`
                INSERT INTO Recipe (id, name, image, updatedAt) VALUES (:id, :name, :image, :updatedAt)
                ON CONFLICT(id) DO UPDATE SET
                    updatedAt = excluded.updatedAt,
                    name = excluded.name,
                    image = excluded.image
            `, { id: recipe.id, name: recipe.name, image: recipe.image, updatedAt: now }).run();

            unit.prepare<void>(`
                INSERT INTO RecipeDetails (
                    recipeId, readyInMinutes, servings, stepCount, ingredientCount, pricePerServing,
                    effortScore, rating, aggregateLikes, vegetarian, vegan, glutenFree, dairyFree
                ) VALUES (
                    :recipeId, :readyInMinutes, :servings, :stepCount, :ingredientCount, :pricePerServing,
                    :effortScore, :rating, :aggregateLikes, :vegetarian, :vegan, :glutenFree, :dairyFree
                )
                ON CONFLICT(recipeId) DO UPDATE SET
                    readyInMinutes = excluded.readyInMinutes,
                    servings = excluded.servings,
                    stepCount = excluded.stepCount,
                    ingredientCount = excluded.ingredientCount,
                    pricePerServing = excluded.pricePerServing,
                    effortScore = excluded.effortScore,
                    rating = excluded.rating,
                    aggregateLikes = excluded.aggregateLikes,
                    vegetarian = excluded.vegetarian,
                    vegan = excluded.vegan,
                    glutenFree = excluded.glutenFree,
                    dairyFree = excluded.dairyFree
            `, {
                recipeId: recipe.id,
                ...details,
                vegetarian: details.vegetarian ? 1 : 0,
                vegan: details.vegan ? 1 : 0,
                glutenFree: details.glutenFree ? 1 : 0,
                dairyFree: details.dairyFree ? 1 : 0,
            }).run();
        }
        unit.complete(true);
    }

    async saveRecipeWithDetails(recipe: Recipe, details: Omit<RecipeDetails, 'recipeId'>): Promise<void> {
        return this.saveRecipesWithDetails([{ recipe, details }]);
    }

    async findRecipeById(id: number): Promise<RecipeWithDetails | undefined> {
        const unit = new Unit(true);
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
        const stmt = unit.prepare<RecipeWithDetails>(`
            SELECT r.id, r.name, r.image,
                   d.readyInMinutes, d.servings, d.stepCount, d.ingredientCount, d.pricePerServing,
                   d.effortScore, d.rating, d.aggregateLikes,
                   d.vegetarian, d.vegan, d.glutenFree, d.dairyFree
            FROM Recipe r
            INNER JOIN RecipeDetails d ON d.recipeId = r.id
            WHERE r.id = :id AND r.updatedAt > :cutoff
        `, { id, cutoff });
        const recipe = stmt.get();
        unit.complete();
        return recipe;
    }

    async removeExpiredRecipes(): Promise<void> {
        const unit = new Unit(false);
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
        unit.prepare<void>("DELETE FROM Recipe WHERE updatedAt <= :cutoff", { cutoff }).run();
        unit.complete(true);
    }
}
