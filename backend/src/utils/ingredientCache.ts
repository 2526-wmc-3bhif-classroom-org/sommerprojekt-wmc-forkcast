export interface CachedIngredient {
    name: string;
    amount: number;
    unit: string;
    measures?: {
        us?: { amount: number; unitShort: string };
        metric?: { amount: number; unitShort: string };
    };
}

interface CacheEntry {
    ingredients: CachedIngredient[];
    expiresAt: number;
}

class IngredientCache {
    private cache = new Map<number, CacheEntry>();
    private readonly TTL_MS = 3600000; // 1 hour

    get(recipeId: number): CachedIngredient[] | null {
        const entry = this.cache.get(recipeId);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(recipeId);
            return null;
        }

        return entry.ingredients;
    }

    set(recipeId: number, ingredients: CachedIngredient[]): void {
        this.cache.set(recipeId, {
            ingredients,
            expiresAt: Date.now() + this.TTL_MS,
        });
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }
}

export const ingredientCache = new IngredientCache();
