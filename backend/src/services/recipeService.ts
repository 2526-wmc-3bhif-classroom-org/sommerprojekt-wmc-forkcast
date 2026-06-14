import { RecipeWithDetails, RecipePreviewResponse, Ingredient, RecipeInstruction, RecipeInstructionsResponse } from '../types';
import { LocalRecipeRepository } from '../repository/localRecipeRepository';
import { RemoteRecipeRepository } from '../repository/remoteRecipeRepository';
import { FavoriteRepository } from '../repository/favoriteRepository';
import { RatingRepository } from '../repository/ratingRepository';
import { Unit } from '../db/unit';
import { calculateEffortScore } from '../utils/effortScore';

export class RecipeService {
    private localRepo: LocalRecipeRepository;
    private remoteRepo: RemoteRecipeRepository;

    constructor() {
        this.localRepo = new LocalRecipeRepository();
        this.remoteRepo = new RemoteRecipeRepository();
    }

    async searchRecipes(query: string, userIp?: string, filters: Record<string, any> = {}, number: number = 10, userId?: number): Promise<RecipePreviewResponse[]> {
        const numResults = filters.number ?? number;
        const localRecipes = await this.localRepo.searchRecipes(query, filters);
        if (localRecipes.length >= numResults) {
            const ids = localRecipes.slice(0, numResults).map(r => r.id);
            const ingredientMap = await this.localRepo.findIngredientsByRecipeIds(ids);
            const previews = localRecipes.slice(0, numResults).map(r => toRecipePreview(r, ingredientMap.get(r.id)));
            return this.annotate(previews, userId);
        }

        let remoteResults: Awaited<ReturnType<typeof this.remoteRepo.searchRecipes>> = [];
        try {
            remoteResults = await this.remoteRepo.searchRecipes(query, userIp, numResults, filters);
        } catch (error) {
            console.error('Remote recipe search failed, returning local results only', error);
            const ids = localRecipes.map(r => r.id);
            const ingredientMap = await this.localRepo.findIngredientsByRecipeIds(ids);
            const previews = localRecipes.map(r => toRecipePreview(r, ingredientMap.get(r.id)));
            return this.annotate(previews, userId);
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

        const previews = combined.slice(0, numResults).map(({ details, ingredients }) =>
            toRecipePreview(details, ingredients ?? cachedIngredientMap.get(details.id))
        );
        return this.annotate(previews, userId);
    }

    async getRecipeById(id: number, userIp?: string, userId?: number): Promise<RecipePreviewResponse | undefined> {
        const localRecipe = await this.localRepo.findRecipeById(id);
        if (localRecipe) {
            const ingredientMap = await this.localRepo.findIngredientsByRecipeIds([id]);
            const preview = toRecipePreview(localRecipe, ingredientMap.get(id));
            return (await this.annotate([preview], userId))[0];
        }

        const remote = await this.remoteRepo.getRecipeById(id, userIp);
        if (!remote) {
            return undefined;
        }
        await this.localRepo.saveRecipeWithDetails(remote.recipe, remote.details, remote.ingredients);
        const preview = toRecipePreview(
            { id: remote.recipe.id, name: remote.recipe.name, image: remote.recipe.image, ...remote.details },
            remote.ingredients
        );
        return (await this.annotate([preview], userId))[0];
    }

    async getRecipesByIds(ids: number[], userIp?: string, userId?: number): Promise<Map<number, RecipePreviewResponse>> {
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

        const annotated = await this.annotate([...result.values()], userId);
        result.clear();
        for (const preview of annotated) {
            result.set(preview.id, preview);
        }

        return result;
    }

    async removeExpiredRecipes(): Promise<void> {
        await this.localRepo.removeExpiredRecipes();
    }

    private async annotate(previews: RecipePreviewResponse[], userId?: number): Promise<RecipePreviewResponse[]> {
        return this.annotateRatings(await this.annotateFavorites(previews, userId), userId);
    }

    private async annotateFavorites(previews: RecipePreviewResponse[], userId?: number): Promise<RecipePreviewResponse[]> {
        if (userId === undefined || previews.length === 0) return previews;
        const ids = previews.map(p => p.id);
        const unit = new Unit(true);
        try {
            const favoriteRepo = new FavoriteRepository(unit);
            const favoritedIds = favoriteRepo.findFavoritedRecipeIds(userId, ids);
            return previews.map(p => ({ ...p, isFavorited: favoritedIds.has(p.id) }));
        } finally {
            unit.complete();
        }
    }

    // Replaces the imported Spoonacular rating with the live user-rating aggregate
    // whenever at least one user has rated the recipe; otherwise keeps the original.
    private async annotateRatings(previews: RecipePreviewResponse[], userId?: number): Promise<RecipePreviewResponse[]> {
        if (previews.length === 0) return previews;
        const ids = previews.map(p => p.id);
        const unit = new Unit(true);
        try {
            const ratingRepo = new RatingRepository(unit);
            const aggregates = ratingRepo.getAggregatesForIds(ids);
            const userRatings = userId !== undefined ? ratingRepo.getUserRatingsForIds(userId, ids) : new Map<number, number>();
            return previews.map(p => {
                const agg = aggregates.get(p.id);
                const rating = agg && agg.count > 0
                    ? { rating: Math.round(agg.average * 10) / 10, count: agg.count }
                    : p.rating;
                const userRating = userRatings.get(p.id);
                return userRating !== undefined ? { ...p, rating, userRating } : { ...p, rating };
            });
        } finally {
            unit.complete();
        }
    }
    
    async getRecipeInstructions(id: number, userIp?: string): Promise<RecipeInstructionsResponse | undefined> {
        const local = await this.localRepo.findInstructionsByRecipeId(id);
        if (local.length > 0) {
            return buildInstructionsResponse(id, local);
        }

        const instructions = await this.remoteRepo.getInstructions(id, userIp);

        // Ensure recipe itself is cached (fetch if needed)
        const localRecipe = await this.localRepo.findRecipeById(id);
        if (!localRecipe) {
            const remote = await this.remoteRepo.getRecipeById(id, userIp);
            if (!remote) return undefined;
            await this.localRepo.saveRecipeWithDetails(remote.recipe, remote.details, remote.ingredients);
        }

        if (instructions.length > 0) {
            await this.localRepo.saveInstructions(id, instructions);
        }

        return buildInstructionsResponse(id, instructions);
    }
}

function buildInstructionsResponse(recipeId: number, instructions: RecipeInstruction[]): RecipeInstructionsResponse {
    const sectionsMap = new Map<string, RecipeInstructionsResponse['sections'][number]>();
    for (const instr of instructions) {
        if (!sectionsMap.has(instr.sectionName)) {
            sectionsMap.set(instr.sectionName, { name: instr.sectionName, steps: [] });
        }
        sectionsMap.get(instr.sectionName)!.steps.push({
            number: instr.stepNumber,
            step: instr.stepText,
            lengthMinutes: instr.lengthMinutes,
            ingredients: instr.ingredients,
            equipment: instr.equipment,
        });
    }
    return { recipeId, sections: Array.from(sectionsMap.values()) };
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
        sourceName: r.sourceName ?? null,
        sourceUrl: r.sourceUrl ?? null,
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
