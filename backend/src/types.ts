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
    readyInMinutes: number;
    calories: number;
    servings: number;
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    updatedAt?: Date;
}

export interface RecipePreview {
    id: number;
    title: string;
    image: string;
    effort: number;
    rating: { rating: number; count: number };
    attributes: { icon: string; text: string }[];
    tags: { icon: string; text: string; color: string }[];
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
