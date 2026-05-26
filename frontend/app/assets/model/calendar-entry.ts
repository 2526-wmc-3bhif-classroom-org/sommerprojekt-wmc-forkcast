import type { RecipePreview } from '~/assets/model/recipe-preview';

export type CalendarEntry = {
    id: number;
    recipeId: number;
    date: string;
    userId: number;
    recipe?: RecipePreview | null;
};
