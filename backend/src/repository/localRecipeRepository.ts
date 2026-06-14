import { Recipe, RecipeDetails, RecipeWithDetails, Ingredient, RecipeInstruction } from '../types';
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
    SELECT r.id, r.name, r.image, r.sourceName, r.sourceUrl,
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

    async findIngredientsByRecipeIds(ids: number[]): Promise<Map<number, Ingredient[]>> {
        const result = new Map<number, Ingredient[]>();
        if (ids.length === 0) return result;
        const unit = new Unit(true);
        const placeholders = ids.map((_, i) => `:id${i}`).join(', ');
        const params: Record<string, any> = {};
        ids.forEach((id, i) => { params[`id${i}`] = id; });
        const rows = unit.prepare<{ recipeId: number; name: string; amount: number; unit: string; usAmount: number | null; usUnit: string | null; metricAmount: number | null; metricUnit: string | null }>(
            `SELECT recipeId, name, amount, unit, usAmount, usUnit, metricAmount, metricUnit FROM RecipeIngredient WHERE recipeId IN (${placeholders})`,
            params
        ).all();
        unit.complete();
        for (const row of rows) {
            if (!result.has(row.recipeId)) result.set(row.recipeId, []);
            result.get(row.recipeId)!.push({
                name: row.name,
                amount: row.amount,
                unit: row.unit,
                measures: {
                    us: row.usAmount !== null ? { amount: row.usAmount, unitShort: row.usUnit ?? '' } : undefined,
                    metric: row.metricAmount !== null ? { amount: row.metricAmount, unitShort: row.metricUnit ?? '' } : undefined,
                },
            });
        }
        return result;
    }

    async saveRecipesWithDetails(entries: Array<{ recipe: Recipe; details: Omit<RecipeDetails, 'recipeId'>; ingredients?: Ingredient[] }>): Promise<void> {
        if (entries.length === 0) return;
        const unit = new Unit(false);
        const now = new Date().toISOString();
        const nutrientCols = NUTRIENT_COLUMNS.join(', ');
        const nutrientVals = NUTRIENT_COLUMNS.map(c => `:${c}`).join(', ');
        const nutrientUpdates = NUTRIENT_COLUMNS.map(c => `${c} = excluded.${c}`).join(', ');

        for (const { recipe, details, ingredients } of entries) {
            unit.prepare<void>(`
                INSERT INTO Recipe (id, name, image, sourceName, sourceUrl, updatedAt) VALUES (:id, :name, :image, :sourceName, :sourceUrl, :updatedAt)
                ON CONFLICT(id) DO UPDATE SET
                    updatedAt = excluded.updatedAt,
                    name = excluded.name,
                    image = excluded.image,
                    sourceName = excluded.sourceName,
                    sourceUrl = excluded.sourceUrl
            `, { id: recipe.id, name: recipe.name, image: recipe.image, sourceName: recipe.sourceName ?? null, sourceUrl: recipe.sourceUrl ?? null, updatedAt: now }).run();

            if (ingredients && ingredients.length > 0) {
                unit.prepare<void>('DELETE FROM RecipeIngredient WHERE recipeId = :recipeId', { recipeId: recipe.id }).run();
                for (const ing of ingredients) {
                    unit.prepare<void>(`
                        INSERT INTO RecipeIngredient (recipeId, name, amount, unit, usAmount, usUnit, metricAmount, metricUnit)
                        VALUES (:recipeId, :name, :amount, :unit, :usAmount, :usUnit, :metricAmount, :metricUnit)
                    `, {
                        recipeId: recipe.id,
                        name: ing.name,
                        amount: ing.amount,
                        unit: ing.unit,
                        usAmount: ing.measures?.us?.amount ?? null,
                        usUnit: ing.measures?.us?.unitShort ?? null,
                        metricAmount: ing.measures?.metric?.amount ?? null,
                        metricUnit: ing.measures?.metric?.unitShort ?? null,
                    }).run();
                }
            }

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

    async saveRecipeWithDetails(recipe: Recipe, details: Omit<RecipeDetails, 'recipeId'>, ingredients?: Ingredient[]): Promise<void> {
        return this.saveRecipesWithDetails([{ recipe, details, ingredients }]);
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
        try {
            const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
            // Only drop stale cache recipes that no user still references. Deleting a
            // recipe referenced by a calendar entry, favorite or rating would fail the
            // FK constraint and corrupt that user's data.
            unit.prepare<void>(
                `DELETE FROM Recipe
                 WHERE updatedAt <= :cutoff
                   AND id NOT IN (SELECT recipeId FROM CalenderEntry)
                   AND id NOT IN (SELECT recipeId FROM FavoriteFood)
                   AND id NOT IN (SELECT recipeId FROM RecipeRating)`,
                { cutoff }
            ).run();
            unit.complete(true);
        } catch (error) {
            unit.complete(false);
            throw error;
        }
    }

    async findInstructionsByRecipeId(id: number): Promise<RecipeInstruction[]> {
        const unit = new Unit(true);
        type Row = { sectionName: string; stepNumber: number; stepText: string; lengthMinutes: number | null; ingredients: string; equipment: string };
        const rows = unit.prepare<Row>(
            `SELECT sectionName, stepNumber, stepText, lengthMinutes, ingredients, equipment FROM RecipeInstruction WHERE recipeId = :id ORDER BY sectionName, stepNumber`,
            { id }
        ).all();
        unit.complete();
        return rows.map(r => ({
            sectionName: r.sectionName,
            stepNumber: r.stepNumber,
            stepText: r.stepText,
            lengthMinutes: r.lengthMinutes,
            ingredients: JSON.parse(r.ingredients ?? '[]'),
            equipment: JSON.parse(r.equipment ?? '[]'),
        }));
    }

    async saveInstructions(recipeId: number, instructions: RecipeInstruction[]): Promise<void> {
        if (instructions.length === 0) return;
        const unit = new Unit(false);
        unit.prepare<void>('DELETE FROM RecipeInstruction WHERE recipeId = :recipeId', { recipeId }).run();
        for (const instr of instructions) {
            unit.prepare<void>(
                `INSERT INTO RecipeInstruction (recipeId, sectionName, stepNumber, stepText, lengthMinutes, ingredients, equipment) VALUES (:recipeId, :sectionName, :stepNumber, :stepText, :lengthMinutes, :ingredients, :equipment)`,
                {
                    recipeId,
                    sectionName: instr.sectionName,
                    stepNumber: instr.stepNumber,
                    stepText: instr.stepText,
                    lengthMinutes: instr.lengthMinutes,
                    ingredients: JSON.stringify(instr.ingredients ?? []),
                    equipment: JSON.stringify(instr.equipment ?? []),
                }
            ).run();
        }
        unit.complete(true);
    }
}
