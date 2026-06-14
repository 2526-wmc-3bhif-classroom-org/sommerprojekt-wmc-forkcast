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
    sourceName?: string | null;
    sourceUrl?: string | null;
    updatedAt?: Date;
}

export interface Ingredient {
    name: string;
    amount: number;
    unit: string;
    measures?: {
        us?: { amount: number; unitShort: string };
        metric?: { amount: number; unitShort: string };
    };
}

export interface RecipeNutrients {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    alcohol: number;
    caffeine: number;
    sugar: number;
    sodium: number;
    fiber: number;
    cholesterol: number;
    saturatedFat: number;
    vitaminA: number;
    vitaminC: number;
    vitaminD: number;
    vitaminE: number;
    vitaminK: number;
    vitaminB1: number;
    vitaminB2: number;
    vitaminB3: number;
    vitaminB5: number;
    vitaminB6: number;
    vitaminB12: number;
    calcium: number;
    copper: number;
    fluoride: number;
    iodine: number;
    iron: number;
    magnesium: number;
    manganese: number;
    phosphorus: number;
    potassium: number;
    selenium: number;
    zinc: number;
    choline: number;
    folate: number;
    folicAcid: number;
}

export interface RecipeDetails extends RecipeNutrients {
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

export interface RecipeWithDetails extends RecipeNutrients {
    id: number;
    name: string;
    image: string;
    sourceName?: string | null;
    sourceUrl?: string | null;
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
    ingredients?: Ingredient[];
    sourceName?: string | null;
    sourceUrl?: string | null;
    isFavorited?: boolean;
    userRating?: number;
}

export interface FriendRequest {
    id: number;
    fromUserId: number;
    toUserId: number;
    createdAt: string;
}

export interface Friend {
    userId: number;
    friendId: number;
}

export interface PublicUser {
    id: number;
    name: string;
    profilePicture: string | null;
    isVerified: boolean;
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

export interface RecipeRating {
    userId: number;
    recipeId: number;
    rating: number;
    createdAt: string;
}

export interface CalendarEntryWithRecipe extends CalendarEntry {
    recipe: RecipePreviewResponse | null;
}

export interface RecipeStepIngredient {
    id: number;
    image: string;
    name: string;
}

export interface RecipeStepEquipment {
    id: number;
    image: string;
    name: string;
    temperature?: { number: number; unit: string };
}

export interface RecipeInstruction {
    sectionName: string;
    stepNumber: number;
    stepText: string;
    lengthMinutes: number | null;
    ingredients: RecipeStepIngredient[];
    equipment: RecipeStepEquipment[];
}

export interface RecipeInstructionsResponse {
    recipeId: number;
    sections: Array<{
        name: string;
        steps: Array<{
            number: number;
            step: string;
            lengthMinutes: number | null;
            ingredients: RecipeStepIngredient[];
            equipment: RecipeStepEquipment[];
        }>;
    }>;
}
