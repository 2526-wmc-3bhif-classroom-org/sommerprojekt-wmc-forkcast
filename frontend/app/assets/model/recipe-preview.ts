export type RecipeIngredient = {
    name: string;
    amount: number;
    unit: string;
    measures?: {
        us?: { amount: number; unitShort: string };
        metric?: { amount: number; unitShort: string };
    };
}

export type RecipePreview = {
    image: string;
    title: string;
    id: number;
    effort: number;
    rating: RecipePreviewRating;
    attributes: RecipePreviewAttribute[];
    tags: RecipePreviewTag[];
    ingredients?: RecipeIngredient[];
    sourceName?: string | null;
    sourceUrl?: string | null;
}

export type RecipePreviewRating = {
    rating: number;
    count: number;
}

export type RecipePreviewAttribute = {
    icon: string;
    text: string;
}

export type RecipePreviewTag = {
    icon: string;
    text: string;
    color: string;
}