import { Unit } from "../db/unit";
import { FavoriteRepository } from "../repository/favoriteRepository";
import { FavoriteFood } from "../types";
import { RecipeService } from "./recipeService";

interface FavoriteFoodWithRecipe extends FavoriteFood {
    recipe?: any;
}

export class FavoriteService {
    private favoriteRepository: FavoriteRepository;

    constructor(unit: Unit) {
        this.favoriteRepository = new FavoriteRepository(unit);
    }

    public getFavorites(userId: number, offset?: number, limit?: number): FavoriteFood[] {
        return this.favoriteRepository.findByUserId(userId, offset, limit);
    }

    public getTotalCount(userId: number): number {
        return this.favoriteRepository.getTotalCount(userId);
    }

    public async populateWithRecipes(favorites: FavoriteFood[], userIp?: string): Promise<FavoriteFoodWithRecipe[]> {
        const recipeIds = [...new Set(favorites.map(f => f.recipeId))];
        
        const recipeService = new RecipeService();
        const recipeMap = await recipeService.getRecipesByIds(recipeIds, userIp, userId);
        
        return favorites.map(favorite => ({
            ...favorite,
            recipe: recipeMap.get(favorite.recipeId) ?? null,
        }));
    }

    public addFavorite(userId: number, recipeId: number): FavoriteFood {
        return this.favoriteRepository.create(userId, recipeId);
    }

    public removeFavorite(userId: number, recipeId: number): boolean {
        return this.favoriteRepository.delete(userId, recipeId);
    }
}
