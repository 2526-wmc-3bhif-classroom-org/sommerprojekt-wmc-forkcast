import { Recipe } from '../types';
import { updateQuota } from "../middleware/apiQuotaLimiter";

export class RemoteRecipeRepository {
    private readonly API_URL = "https://api.spoonacular.com/recipes";
    private readonly API_KEY = process.env.SPOONACULAR_API_KEY || "key";

    async searchRecipes(query: string, userIp?: string, number: number = 4): Promise<Recipe[]> {
        const url = `${this.API_URL}/complexSearch?query=${encodeURIComponent(query)}&number=${number}&apiKey=${this.API_KEY}`;
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
            id: r.id,
            name: r.title,
            image: r.image
        }));
    }

    async getRecipeById(id: number, userIp?: string): Promise<Recipe> {
        const url = `${this.API_URL}/${id}/information?apiKey=${this.API_KEY}`;
        const response = await fetch(url);

        if (userIp) {
            const pointsUsed = parseInt(response.headers.get("X-API-Quota-Request") || "0", 10);
            updateQuota(userIp, pointsUsed);
        }

        if (!response.ok) {
            throw new Error(`Error fetching recipe details: ${response.statusText}`);
        }

        const res = await response.json();
        return {
            id: res.id,
            name: res.title,
            image: res.image
        };
    }
}
