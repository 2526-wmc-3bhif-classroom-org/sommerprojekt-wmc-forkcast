export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    profilePicture: string | null;
    isVerified: boolean;
}

export interface Recipe {
    id: number;
    name: string;
    image: string;
    updatedAt?: Date;
}

export interface RecipeDetails {
    recipeId: number;
    readyInMinutes: number;
    servings: number;
    stepCount: number;
    ingredientCount: number;
    pricePerServing: number;
    effortScore: number;
    rating: number;
    aggregateLikes: number;
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
}

export interface RecipeWithDetails {
    id: number;
    name: string;
    image: string;
    readyInMinutes: number;
    servings: number;
    stepCount: number;
    ingredientCount: number;
    pricePerServing: number;
    effortScore: number;
    rating: number;
    aggregateLikes: number;
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
}

export interface RecipePreviewResponse {
    id: number;
    title: string;
    image: string;
    effort: number;
    rating: { rating: number; count: number };
    attributes: Array<{ icon: string; text: string }>;
    tags: Array<{ icon: string; text: string; color: string }>;
}

export interface Notification {
    id: number;
    type: string;
    content: string;
    isRead: boolean;
    userId: number;
}

export interface Friend {
    userId: number;
    friendId: number;
}

export interface CalendarEntry {
    id: number;
    date: Date;
    userId: number;
    recipeId: number;
}

export interface FavoriteFood {
    userId: number;
    recipeId: number;
}

export interface CalendarEntryWithRecipe extends CalendarEntry {
    recipe: RecipePreviewResponse | null;
}
