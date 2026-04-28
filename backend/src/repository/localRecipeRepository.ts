import { Recipe } from '../types';
import { Unit } from "../db/unit";
import { CACHE_TTL_MS } from "../app";

export class LocalRecipeRepository {
    private readonly COLUMNS = "id, name, image, readyInMinutes, calories, servings, vegetarian, vegan, glutenFree, dairyFree";

    async searchRecipes(query: string): Promise<Recipe[]> {
        const unit = new Unit(true);
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
        const stmt = unit.prepare<Recipe>(`SELECT ${this.COLUMNS} FROM Recipe WHERE name LIKE :query AND updatedAt > :cutoff`, {
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
        const stmt = unit.prepare<void>(`
            INSERT INTO Recipe (id, name, image, readyInMinutes, calories, servings, vegetarian, vegan, glutenFree, dairyFree, updatedAt)
            VALUES (:id, :name, :image, :readyInMinutes, :calories, :servings, :vegetarian, :vegan, :glutenFree, :dairyFree, :updatedAt)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                image = excluded.image,
                readyInMinutes = excluded.readyInMinutes,
                calories = excluded.calories,
                servings = excluded.servings,
                vegetarian = excluded.vegetarian,
                vegan = excluded.vegan,
                glutenFree = excluded.glutenFree,
                dairyFree = excluded.dairyFree,
                updatedAt = excluded.updatedAt
        `, {
            id: recipe.id,
            name: recipe.name,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            calories: recipe.calories,
            servings: recipe.servings,
            vegetarian: recipe.vegetarian ? 1 : 0,
            vegan: recipe.vegan ? 1 : 0,
            glutenFree: recipe.glutenFree ? 1 : 0,
            dairyFree: recipe.dairyFree ? 1 : 0,
            updatedAt: now
        });
        stmt.run();
        unit.complete(true);
    }

    async findRecipeById(id: number): Promise<Recipe | undefined> {
        const unit = new Unit(true);
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
        const stmt = unit.prepare<Recipe>(`SELECT ${this.COLUMNS} FROM Recipe WHERE id = :id AND updatedAt > :cutoff`, {
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
