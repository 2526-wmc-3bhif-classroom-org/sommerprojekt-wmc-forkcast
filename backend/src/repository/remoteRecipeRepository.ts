import { Recipe, RecipeDetails } from '../types';
import { updateQuota } from "../middleware/apiQuotaLimiter";
import { calculateEffortScore } from "../utils/effortScore";

type RecipeWithRawDetails = { recipe: Recipe; details: Omit<RecipeDetails, 'recipeId'> };

export class RemoteRecipeRepository {
    private readonly API_URL = "https://api.spoonacular.com/recipes";
    private readonly API_KEY = process.env.SPOONACULAR_API_KEY || "key";

    async searchRecipes(query: string, userIp?: string, number: number = 4, filters: Record<string, any> = {}): Promise<RecipeWithRawDetails[]> {
        const params = new URLSearchParams();
        params.append("query", query);
        params.append("number", String(filters.number ?? number));
        params.append("addRecipeInformation", "true");
        params.append("apiKey", this.API_KEY);

        for (const [key, value] of Object.entries(filters)) {
            if (key !== "number" && value !== undefined && value !== "") {
                params.append(key, String(value));
            }
        }

        const url = `${this.API_URL}/complexSearch?${params.toString()}`;
        const response = await fetch(url);

        if (userIp) {
            const pointsUsed = parseInt(response.headers.get("X-API-Quota-Request") || "0", 10);
            updateQuota(userIp, pointsUsed);
        }

        if (!response.ok) {
            throw new Error(`Error fetching recipes: ${response.statusText}`);
        }

        const res = await response.json();
        return res.results.map((r: any) => ({
            recipe: { id: r.id, name: r.title, image: r.image },
            details: this.extractDetails(r),
        }));
    }

    async getRecipesByIds(ids: number[], userIp?: string): Promise<RecipeWithRawDetails[]> {
        if (ids.length === 0) return [];
        const url = `${this.API_URL}/informationBulk?ids=${ids.join(',')}&apiKey=${this.API_KEY}`;
        const response = await fetch(url);

        if (userIp) {
            const pointsUsed = parseInt(response.headers.get("X-API-Quota-Request") || "0", 10);
            updateQuota(userIp, pointsUsed);
        }

        if (!response.ok) {
            throw new Error(`Error fetching bulk recipes: ${response.statusText}`);
        }

        const results: any[] = await response.json();
        return results.map((r: any) => ({
            recipe: { id: r.id, name: r.title, image: r.image },
            details: this.extractDetails(r),
        }));
    }

    async getRecipeById(id: number, userIp?: string): Promise<RecipeWithRawDetails | undefined> {
        const url = `${this.API_URL}/${id}/information?apiKey=${this.API_KEY}`;
        const response = await fetch(url);

        if (userIp) {
            const pointsUsed = parseInt(response.headers.get("X-API-Quota-Request") || "0", 10);
            updateQuota(userIp, pointsUsed);
        }

        if (response.status === 404) {
            return undefined;
        }

        if (!response.ok) {
            throw new Error(`Error fetching recipe details: ${response.statusText}`);
        }

        const r = await response.json();
        return {
            recipe: { id: r.id, name: r.title, image: r.image },
            details: this.extractDetails(r),
        };
    }

    private extractDetails(r: any): Omit<RecipeDetails, 'recipeId'> {
        const stepCount = (r.analyzedInstructions ?? [])
            .reduce((sum: number, section: any) => sum + (section.steps?.length ?? 0), 0);
        const ingredientCount = r.extendedIngredients?.length ?? 0;
        const readyInMinutes = r.readyInMinutes ?? 0;

        const pricePerServing = r.pricePerServing ?? 0;

        return {
            readyInMinutes,
            servings: r.servings ?? 0,
            stepCount,
            ingredientCount,
            pricePerServing,
            effortScore: calculateEffortScore(readyInMinutes, stepCount, ingredientCount, pricePerServing),
            rating: Math.max(1, Math.min(5, Math.round((r.spoonacularScore ?? 0) / 20))),
            aggregateLikes: r.aggregateLikes ?? 0,
            vegetarian: r.vegetarian ?? false,
            vegan: r.vegan ?? false,
            glutenFree: r.glutenFree ?? false,
            dairyFree: r.dairyFree ?? false,
        };
    }
}
