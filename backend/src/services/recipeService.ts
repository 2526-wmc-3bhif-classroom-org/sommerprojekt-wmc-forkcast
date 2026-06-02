import { RecipeWithDetails, RecipePreviewResponse, Ingredient } from '../types';
import { LocalRecipeRepository } from '../repository/localRecipeRepository';
import { RemoteRecipeRepository } from '../repository/remoteRecipeRepository';
import { calculateEffortScore } from '../utils/effortScore';

export class RecipeService {
    private localRepo: LocalRecipeRepository;
    private remoteRepo: RemoteRecipeRepository;

    constructor() {
        this.localRepo = new LocalRecipeRepository();
        this.remoteRepo = new RemoteRecipeRepository();
    }

    async searchRecipes(query: string, userIp?: string, filters: Record<string, any> = {}, number: number = 10): Promise<RecipePreviewResponse[]> {
        const numResults = filters.number ?? number;
        const localRecipes = await this.localRepo.searchRecipes(query, filters);
        if (localRecipes.length >= numResults) {
            const ids = localRecipes.slice(0, numResults).map(r => r.id);
            const ingredientMap = await this.localRepo.findIngredientsByRecipeIds(ids);
            return localRecipes.slice(0, numResults).map(r => toRecipePreview(r, ingredientMap.get(r.id)));
        }

        let remoteResults: Awaited<ReturnType<typeof this.remoteRepo.searchRecipes>> = [];
        try {
            remoteResults = await this.remoteRepo.searchRecipes(query, userIp, numResults, filters);
        } catch (error) {
            console.error('Remote recipe search failed, returning local results only', error);
            const ids = localRecipes.map(r => r.id);
            const ingredientMap = await this.localRepo.findIngredientsByRecipeIds(ids);
            return localRecipes.map(r => toRecipePreview(r, ingredientMap.get(r.id)));
        }

        this.localRepo.saveRecipesWithDetails(remoteResults).catch(console.error);

        const existingIds = new Set(localRecipes.map(r => r.id));
        const combined: Array<{ details: RecipeWithDetails; ingredients?: Ingredient[] }> = localRecipes.map(r => ({ details: r }));
        for (const { recipe, details, ingredients } of remoteResults) {
            if (!existingIds.has(recipe.id)) {
                combined.push({ details: { id: recipe.id, name: recipe.name, image: recipe.image, ...details }, ingredients });
            }
        }

        const cachedIds = localRecipes.map(r => r.id);
        const cachedIngredientMap = await this.localRepo.findIngredientsByRecipeIds(cachedIds);

        return combined.slice(0, numResults).map(({ details, ingredients }) =>
            toRecipePreview(details, ingredients ?? cachedIngredientMap.get(details.id))
        );
    }

    async getRecipeById(id: number, userIp?: string): Promise<RecipePreviewResponse | undefined> {
        const localRecipe = await this.localRepo.findRecipeById(id);
        if (localRecipe) {
            const ingredientMap = await this.localRepo.findIngredientsByRecipeIds([id]);
            return toRecipePreview(localRecipe, ingredientMap.get(id));
        }

        const remote = await this.remoteRepo.getRecipeById(id, userIp);
        if (!remote) {
            return undefined;
        }
        await this.localRepo.saveRecipeWithDetails(remote.recipe, remote.details, remote.ingredients);
        return toRecipePreview(
            { id: remote.recipe.id, name: remote.recipe.name, image: remote.recipe.image, ...remote.details },
            remote.ingredients
        );
    }

    async getRecipesByIds(ids: number[], userIp?: string): Promise<Map<number, RecipePreviewResponse>> {
        const result = new Map<number, RecipePreviewResponse>();
        if (ids.length === 0) return result;

        const cached = await this.localRepo.findRecipesByIds(ids);
        const cachedIngredientMap = await this.localRepo.findIngredientsByRecipeIds(cached.map(r => r.id));
        for (const r of cached) {
            result.set(r.id, toRecipePreview(r, cachedIngredientMap.get(r.id)));
        }

        const uncachedIds = ids.filter(id => !result.has(id));
        if (uncachedIds.length > 0) {
            const remote = await this.remoteRepo.getRecipesByIds(uncachedIds, userIp);
            this.localRepo.saveRecipesWithDetails(remote).catch(console.error);
            for (const { recipe, details, ingredients } of remote) {
                result.set(recipe.id, toRecipePreview(
                    { id: recipe.id, name: recipe.name, image: recipe.image, ...details },
                    ingredients
                ));
            }
        }

        return result;
    }

    async removeExpiredRecipes(): Promise<void> {
        await this.localRepo.removeExpiredRecipes();
    }
}

function toRecipePreview(r: RecipeWithDetails, ingredients?: Ingredient[]): RecipePreviewResponse {
    return {
        id: r.id,
        title: r.name,
        image: r.image,
        effort: calculateEffortScore(r.readyInMinutes, r.stepCount, r.ingredientCount, r.pricePerServing),
        rating: {
            rating: r.rating,
            count: r.aggregateLikes,
        },
        attributes: [
            { icon: "clock", text: `${r.readyInMinutes} min` },
            { icon: "users", text: `${r.servings} servings` },
        ],
        tags: buildTags(r),
        ingredients: ingredients ?? [],
    };
}

function buildTags(r: RecipeWithDetails): Array<{ icon: string; text: string; color: string }> {
    const tags: Array<{ icon: string; text: string; color: string }> = [];
    if (r.vegan) {
        tags.push({ icon: "seedling", text: "Vegan", color: "success" });
    } else if (r.vegetarian) {
        tags.push({ icon: "leaf", text: "Vegetarian", color: "success" });
    }
    if (r.glutenFree) tags.push({ icon: "wheat-awn-circle-exclamation", text: "Gluten Free", color: "warning" });
    if (r.dairyFree) tags.push({ icon: "droplet-slash", text: "Dairy Free", color: "primary" });
    return tags;
}
