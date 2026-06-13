import type { RecipePreview } from './recipe-preview';

export type FavoriteItem = {
    userId: number;
    recipeId: number;
    recipe: RecipePreview | null;
}

export type FavoritesResponse = {
    count: number;
    populated: boolean;
    foods: FavoriteItem[];
}
