import { Recipe, RecipeDetails, RecipeWithDetails } from '../types';
import { Unit } from "../db/unit";
import { CACHE_TTL_MS } from "../app";

const NUTRIENT_COLUMNS = [
    'calories', 'carbs', 'protein', 'fat', 'alcohol', 'caffeine', 'sugar',
    'sodium', 'fiber', 'cholesterol', 'saturatedFat', 'vitaminA', 'vitaminC',
    'vitaminD', 'vitaminE', 'vitaminK', 'vitaminB1', 'vitaminB2', 'vitaminB3',
    'vitaminB5', 'vitaminB6', 'vitaminB12', 'calcium', 'copper', 'fluoride',
    'iodine', 'iron', 'magnesium', 'manganese', 'phosphorus', 'potassium',
    'selenium', 'zinc', 'choline', 'folate', 'folicAcid',
] as const;

type NutrientColumn = typeof NUTRIENT_COLUMNS[number];

const RANGE_FILTERABLE_COLUMNS = new Set<string>([...NUTRIENT_COLUMNS, 'servings']);

const NUTRIENT_SELECT = NUTRIENT_COLUMNS.map(c => `d.${c}`).join(', ');

const BASE_SELECT = `
    SELECT r.id, r.name, r.image,
           d.readyInMinutes, d.servings, d.stepCount, d.ingredientCount, d.pricePerServing,
           d.effortScore, d.rating, d.aggregateLikes,
           d.vegetarian, d.vegan, d.glutenFree, d.dairyFree,
           ${NUTRIENT_SELECT}
    FROM Recipe r
    INNER JOIN RecipeDetails d ON d.recipeId = r.id
`;

export class LocalRecipeRepository {
    async searchRecipes(query: string, filters: Record<string, any> = {}): Promise<RecipeWithDetails[]> {
        const unit = new Unit(true);
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();

        const conditions: string[] = ['r.name LIKE :query', 'r.updatedAt > :cutoff'];
        const params: Record<string, any> = { query: `%${query}%`, cutoff };

        if (filters.maxReadyTime !== undefined) {
            conditions.push('d.readyInMinutes <= :maxReadyTime');
            params.maxReadyTime = filters.maxReadyTime;
        }

        for (const [key, value] of Object.entries(filters)) {
            if (value === undefined) continue;
            const isMin = key.startsWith('min');
            const isMax = key.startsWith('max');
            if (!isMin && !isMax) continue;
            const colName = key.slice(3).charAt(0).toLowerCase() + key.slice(4);
            if (!RANGE_FILTERABLE_COLUMNS.has(colName)) continue;
            conditions.push(`d.${colName} ${isMin ? '>=' : '<='} :${key}`);
            params[key] = value;
        }

        if (filters.diet) {
            const diet = (filters.diet as string).toLowerCase();
            if (diet.includes('vegan')) {
                conditions.push('d.vegan = 1');
            } else if (diet.includes('vegetarian')) {
                conditions.push('d.vegetarian = 1');
            }
        }
        if (filters.intolerances) {
            const intolerances = (filters.intolerances as string).toLowerCase();
            if (intolerances.includes('gluten') || intolerances.includes('wheat')) {
                conditions.push('d.glutenFree = 1');
            }
            if (intolerances.includes('dairy')) {
                conditions.push('d.dairyFree = 1');
            }
        }

        const stmt = unit.prepare<RecipeWithDetails>(
            `${BASE_SELECT} WHERE ${conditions.join(' AND ')}`,
            params
        );
        const recipes = stmt.all();
        unit.complete();
        return recipes;
    }

    async saveRecipesWithDetails(entries: Array<{ recipe: Recipe; details: Omit<RecipeDetails, 'recipeId'> }>): Promise<void> {
        if (entries.length === 0) return;
        const unit = new Unit(false);
        const now = new Date().toISOString();
        const nutrientCols = NUTRIENT_COLUMNS.join(', ');
        const nutrientVals = NUTRIENT_COLUMNS.map(c => `:${c}`).join(', ');
        const nutrientUpdates = NUTRIENT_COLUMNS.map(c => `${c} = excluded.${c}`).join(', ');

        for (const { recipe, details } of entries) {
            unit.prepare<void>(`
                INSERT INTO Recipe (id, name, image, updatedAt) VALUES (:id, :name, :image, :updatedAt)
                ON CONFLICT(id) DO UPDATE SET
                    updatedAt = excluded.updatedAt,
                    name = excluded.name,
                    image = excluded.image
            `, { id: recipe.id, name: recipe.name, image: recipe.image, updatedAt: now }).run();

            unit.prepare<void>(`
                INSERT INTO RecipeDetails (
                    recipeId, readyInMinutes, servings, stepCount, ingredientCount, pricePerServing,
                    effortScore, rating, aggregateLikes, vegetarian, vegan, glutenFree, dairyFree,
                    ${nutrientCols}
                ) VALUES (
                    :recipeId, :readyInMinutes, :servings, :stepCount, :ingredientCount, :pricePerServing,
                    :effortScore, :rating, :aggregateLikes, :vegetarian, :vegan, :glutenFree, :dairyFree,
                    ${nutrientVals}
                )
                ON CONFLICT(recipeId) DO UPDATE SET
                    readyInMinutes = excluded.readyInMinutes,
                    servings = excluded.servings,
                    stepCount = excluded.stepCount,
                    ingredientCount = excluded.ingredientCount,
                    pricePerServing = excluded.pricePerServing,
                    effortScore = excluded.effortScore,
                    rating = excluded.rating,
                    aggregateLikes = excluded.aggregateLikes,
                    vegetarian = excluded.vegetarian,
                    vegan = excluded.vegan,
                    glutenFree = excluded.glutenFree,
                    dairyFree = excluded.dairyFree,
                    ${nutrientUpdates}
            `, {
                recipeId: recipe.id,
                ...details,
                vegetarian: details.vegetarian ? 1 : 0,
                vegan: details.vegan ? 1 : 0,
                glutenFree: details.glutenFree ? 1 : 0,
                dairyFree: details.dairyFree ? 1 : 0,
            }).run();
        }
        unit.complete(true);
    }

    async saveRecipeWithDetails(recipe: Recipe, details: Omit<RecipeDetails, 'recipeId'>): Promise<void> {
        return this.saveRecipesWithDetails([{ recipe, details }]);
    }

    async findRecipesByIds(ids: number[]): Promise<RecipeWithDetails[]> {
        if (ids.length === 0) return [];
        const unit = new Unit(true);
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
        const placeholders = ids.map((_, i) => `:id${i}`).join(', ');
        const params: Record<string, any> = { cutoff };
        ids.forEach((id, i) => { params[`id${i}`] = id; });
        const stmt = unit.prepare<RecipeWithDetails>(
            `${BASE_SELECT} WHERE r.id IN (${placeholders}) AND r.updatedAt > :cutoff`,
            params
        );
        const recipes = stmt.all();
        unit.complete();
        return recipes;
    }

    async findRecipeById(id: number): Promise<RecipeWithDetails | undefined> {
        const unit = new Unit(true);
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
        const stmt = unit.prepare<RecipeWithDetails>(
            `${BASE_SELECT} WHERE r.id = :id AND r.updatedAt > :cutoff`,
            { id, cutoff }
        );
        const recipe = stmt.get();
        unit.complete();
        return recipe;
    }

    async removeExpiredRecipes(): Promise<void> {
        const unit = new Unit(false);
        const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
        unit.prepare<void>("DELETE FROM Recipe WHERE updatedAt <= :cutoff", { cutoff }).run();
        unit.complete(true);
    }
}
