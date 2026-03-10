import { Recipe } from '../types';
import {Unit} from "../db/unit";
import { CACHE_TTL_MS } from "../app";

export class RemoteRecipeStore {
    private readonly API_URL = "https://api.spoonacular.com/recipes";
    private readonly API_KEY = process.env.SPOONACULAR_API_KEY || "key";

    async searchRecipes(query: string, number: number = 4): Promise<Recipe[]> {
        // First we look for recipes in our local database that match the query. If we find enough recipes, we return them.
        const data: Recipe[] = await this.searchRecipesInDatabase(query);
        if(data.length >= number) return data.slice(0, number);

        // If we don't find enough recipes in our local database, we call the Spoonacular API to get more recipes that match the query.
        const url = `${this.API_URL}/complexSearch?query=${encodeURIComponent(query)}&number=${number}&apiKey=${this.API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching recipes: ${response.statusText}`);
        }

        const res = await response.json();
        const apiRecipes: Recipe[] = res.results.map((r: any) => ({
            id: r.id,
            name: r.title,
            image: r.image
        }));

        for (const recipe of apiRecipes) {
            try {
                await this.saveRecipeToDatabase(recipe);
            } catch (error) {
                console.warn(`Failed to save recipe ${recipe.id} to database`, error);
            }
        }

        // Merge results ensuring uniqueness by ID
        const existingIds = new Set(data.map(r => r.id));
        const combined = [...data];
        for (const r of apiRecipes) {
            if (!existingIds.has(r.id)) {
                combined.push(r);
            }
        }

        return combined.slice(0, number);
    }

    async searchRecipesInDatabase(query: string): Promise<Recipe[]> {
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

    async saveRecipeToDatabase(recipe: Recipe): Promise<void> {
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

    async getRecipeById(id: number): Promise<Recipe> {
        const data = await this.findRecipeByIdInDatabase(id);
        if(data) return data;

        const url = `${this.API_URL}/${id}/information?apiKey=${this.API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching recipe details: ${response.statusText}`);
        }

        const res = await response.json();
        const recipe: Recipe = {
            id: res.id,
            name: res.title,
            image: res.image
        };
        await this.saveRecipeToDatabase(recipe);
        return recipe;
    }

    async findRecipeByIdInDatabase(id: number): Promise<Recipe | undefined> {
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
