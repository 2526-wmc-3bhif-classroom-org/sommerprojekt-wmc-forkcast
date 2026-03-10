import { Recipe } from '../types';

export class RemoteRecipeStore {
    private readonly API_URL = "https://api.spoonacular.com/recipes";
    private readonly API_KEY = process.env.SPOONACULAR_API_KEY || "key";

    async searchRecipes(query: string, number: number = 10): Promise<Recipe[]> {
        const url = `${this.API_URL}/complexSearch?query=${encodeURIComponent(query)}&number=${number}&apiKey=${this.API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching recipes: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results.map((r: any) => ({
            id: r.id,
            name: r.title,
            image: r.image
        }));
    }

    async getRecipeById(id: number): Promise<Recipe> {
        const url = `${this.API_URL}/${id}/information?apiKey=${this.API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching recipe details: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            id: data.id,
            name: data.title,
            image: data.image
        };
    }
}