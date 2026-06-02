import { CalendarRepository } from '../repository/calendarRepository';
import { RecipeService } from './recipeService';
import { Unit } from '../db/unit';
import { IngredientAggregator, UnitSystem } from '../utils/ingredientAggregator';
import { Ingredient } from '../types';

interface ShoppingListIngredient {
    name: string;
    us?: { amount: number; unit: string };
    metric?: { amount: number; unit: string };
}

type CachedIngredient = Ingredient;

interface ShoppingListResponse {
    dateRange: {
        start: string;
        end: string;
    };
    recipeCount: number;
    ingredients: ShoppingListIngredient[];
}

export class ShoppingListService {
    private calendarRepository?: CalendarRepository;
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
            const uniqueIds = [...new Set(entries.map(e => e.recipeId))];

            for (const recipeId of uniqueIds) {
                const recipe = await this.recipeService.getRecipeById(recipeId);
                if (recipe?.ingredients) {
                    allIngredients.push(...recipe.ingredients);
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

}
