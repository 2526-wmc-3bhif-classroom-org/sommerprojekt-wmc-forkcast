import { CalendarRepository } from '../repository/calendarRepository';
import { RecipeService } from './recipeService';
import { Unit } from '../db/unit';
import { ingredientCache, CachedIngredient } from '../utils/ingredientCache';
import { IngredientAggregator, UnitSystem } from '../utils/ingredientAggregator';

interface ShoppingListIngredient {
    name: string;
    us?: { amount: number; unit: string };
    metric?: { amount: number; unit: string };
}

interface ShoppingListResponse {
    dateRange: {
        start: string;
        end: string;
    };
    recipeCount: number;
    ingredients: ShoppingListIngredient[];
}

export class ShoppingListService {
    private calendarRepository: CalendarRepository;
    private recipeService: RecipeService;
    private aggregator: IngredientAggregator;

    constructor() {
        this.recipeService = new RecipeService();
        this.aggregator = new IngredientAggregator();
    }

    async getShoppingList(
        userId: number,
        fromDate: Date,
        toDate: Date,
        units: UnitSystem = 'metric'
    ): Promise<ShoppingListResponse> {
        const unit = new Unit(true);
        this.calendarRepository = new CalendarRepository(unit);

        try {
            const entries = this.calendarRepository.findByUserIdAndDateRange(userId, fromDate, toDate);

            if (entries.length === 0) {
                return {
                    dateRange: {
                        start: fromDate.toISOString().split('T')[0],
                        end: toDate.toISOString().split('T')[0],
                    },
                    recipeCount: 0,
                    ingredients: [],
                };
            }

            const allIngredients: CachedIngredient[] = [];

            for (const entry of entries) {
                const cached = ingredientCache.get(entry.recipeId);

                if (cached) {
                    allIngredients.push(...cached);
                } else {
                    const recipe = await this.recipeService.getRecipeById(entry.recipeId);
                    if (recipe) {
                        const ingredients = this.extractIngredients(recipe);
                        ingredientCache.set(entry.recipeId, ingredients);
                        allIngredients.push(...ingredients);
                    }
                }
            }

            const aggregated = this.aggregator.aggregate(allIngredients, units);

            return {
                dateRange: {
                    start: fromDate.toISOString().split('T')[0],
                    end: toDate.toISOString().split('T')[0],
                },
                recipeCount: entries.length,
                ingredients: aggregated,
            };
        } finally {
            unit.complete();
        }
    }

    private extractIngredients(recipe: any): CachedIngredient[] {
        if (!recipe || !recipe.extendedIngredients) {
            return [];
        }

        return recipe.extendedIngredients.map((ing: any) => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            measures: ing.measures,
        }));
    }
}
