import { Recipe, RecipeDetails } from '../types';
import { updateQuota } from "../middleware/apiQuotaLimiter";
import { calculateEffortScore } from "../utils/effortScore";

type RecipeWithRawDetails = { recipe: Recipe; details: Omit<RecipeDetails, 'recipeId'> };

export class RemoteRecipeRepository {
    private readonly API_URL = "https://api.spoonacular.com/recipes";
    private readonly API_KEY = process.env.SPOONACULAR_API_KEY || "key";

    async searchRecipes(query: string, userIp?: string, number: number = 4): Promise<RecipeWithRawDetails[]> {
        const url = `${this.API_URL}/complexSearch?query=${encodeURIComponent(query)}&number=${number}&addRecipeInformation=true&apiKey=${this.API_KEY}`;
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

        return {
            readyInMinutes,
            servings: r.servings ?? 0,
            stepCount,
            ingredientCount,
            effortScore: calculateEffortScore(readyInMinutes, stepCount, ingredientCount),
            rating: Math.max(1, Math.min(5, Math.round((r.spoonacularScore ?? 0) / 20))),
            aggregateLikes: r.aggregateLikes ?? 0,
            vegetarian: r.vegetarian ?? false,
            vegan: r.vegan ?? false,
            glutenFree: r.glutenFree ?? false,
            dairyFree: r.dairyFree ?? false,
        };
    }
}
