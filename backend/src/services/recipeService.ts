import { Recipe, RecipePreview } from '../types';
import { LocalRecipeRepository } from '../repository/localRecipeRepository';
import { RemoteRecipeRepository } from '../repository/remoteRecipeRepository';

export class RecipeService {
    private localRepo: LocalRecipeRepository;
    private remoteRepo: RemoteRecipeRepository;

    constructor() {
        this.localRepo = new LocalRecipeRepository();
        this.remoteRepo = new RemoteRecipeRepository();
    }

    async searchRecipes(query: string, userIp?: string, number: number = 4): Promise<RecipePreview[]> {
        const localRecipes = await this.localRepo.searchRecipes(query);
        if (localRecipes.length >= number) {
            return localRecipes.slice(0, number).map(toRecipePreview);
        }

        const remoteRecipes = await this.remoteRepo.searchRecipes(query, userIp, number);

        for (const recipe of remoteRecipes) {
            this.localRepo.saveRecipe(recipe).catch(console.error);
        }

        const existingIds = new Set(localRecipes.map(r => r.id));
        const combined = [...localRecipes];
        for (const r of remoteRecipes) {
            if (!existingIds.has(r.id)) {
                combined.push(r);
            }
        }

        return combined.slice(0, number).map(toRecipePreview);
    }

    async getRecipeById(id: number, userIp?: string): Promise<RecipePreview | undefined> {
        const localRecipe = await this.localRepo.findRecipeById(id);
        if (localRecipe) {
            return toRecipePreview(localRecipe);
        }

        try {
            const remoteRecipe = await this.remoteRepo.getRecipeById(id, userIp);
            await this.localRepo.saveRecipe(remoteRecipe);
            return toRecipePreview(remoteRecipe);
        } catch (error) {
            console.error(`Failed to fetch recipe ${id} from remote source`, error);
            return undefined;
        }
    }

    async removeExpiredRecipes(): Promise<void> {
        await this.localRepo.removeExpiredRecipes();
    }
}

function toRecipePreview(recipe: Recipe): RecipePreview {
    const tags: RecipePreview["tags"] = [];
    if (recipe.vegan)       tags.push({ icon: "seedling",        text: "Vegan",       color: "success" });
    else if (recipe.vegetarian) tags.push({ icon: "leaf",        text: "Vegetarian",  color: "success" });
    if (recipe.glutenFree)  tags.push({ icon: "wheat-awn-slash", text: "Gluten-Free", color: "warning" });
    if (recipe.dairyFree)   tags.push({ icon: "droplet-slash",   text: "Dairy-Free",  color: "primary" });

    return {
        id: recipe.id,
        title: recipe.name,
        image: recipe.image,
        effort: Math.min(recipe.readyInMinutes, 100),
        rating: { rating: 0, count: 0 },
        attributes: [
            { icon: "clock",    text: `${recipe.readyInMinutes} min` },
            { icon: "fire",     text: `${recipe.calories} kcal` },
            { icon: "utensils", text: `${recipe.servings} servings` },
        ],
        tags,
    };
}
