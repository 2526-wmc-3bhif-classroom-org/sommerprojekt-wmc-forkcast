import { Recipe } from '../types';
import { updateQuota } from "../middleware/apiQuotaLimiter";

export class RemoteRecipeRepository {
    private readonly API_URL = "https://api.spoonacular.com/recipes";
    private readonly API_KEY = process.env.SPOONACULAR_API_KEY || "key";

    async searchRecipes(query: string, userIp?: string, number: number = 4): Promise<Recipe[]> {
        const url = `${this.API_URL}/complexSearch?query=${encodeURIComponent(query)}&number=${number}&addRecipeInformation=true&addRecipeNutrition=true&apiKey=${this.API_KEY}`;
        const response = await fetch(url);

        if (userIp) {
            const pointsUsed = parseInt(response.headers.get("X-API-Quota-Request") || "0", 10);
            updateQuota(userIp, pointsUsed);
        }

        if (!response.ok) {
            throw new Error(`Error fetching recipes: ${response.statusText}`);
        }

        const res = await response.json();
        return res.results.map((r: any) => this.mapToRecipe(r));
    }

    async getRecipeById(id: number, userIp?: string): Promise<Recipe> {
        const url = `${this.API_URL}/${id}/information?includeNutrition=true&apiKey=${this.API_KEY}`;
        const response = await fetch(url);

        if (userIp) {
            const pointsUsed = parseInt(response.headers.get("X-API-Quota-Request") || "0", 10);
            updateQuota(userIp, pointsUsed);
        }

        if (!response.ok) {
            throw new Error(`Error fetching recipe details: ${response.statusText}`);
        }

        const res = await response.json();
        return this.mapToRecipe(res);
    }

    private mapToRecipe(r: any): Recipe {
        const nutrients: any[] = r.nutrition?.nutrients ?? [];
        const calorieEntry = nutrients.find((n: any) => n.name === "Calories");
        return {
            id: r.id,
            name: r.title,
            image: r.image,
            readyInMinutes: r.readyInMinutes ?? 0,
            calories: Math.round(calorieEntry?.amount ?? 0),
            servings: r.servings ?? 1,
            vegetarian: r.vegetarian ?? false,
            vegan: r.vegan ?? false,
            glutenFree: r.glutenFree ?? false,
            dairyFree: r.dairyFree ?? false,
        };
    }
}
