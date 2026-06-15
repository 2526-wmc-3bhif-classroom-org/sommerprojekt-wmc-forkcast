import { Recipe, RecipeDetails, Ingredient, RecipeInstruction, RecipeStepIngredient, RecipeStepEquipment } from '../types';
import { updateQuota } from "../middleware/apiQuotaLimiter";
import { calculateEffortScore } from "../utils/effortScore";

type RecipeWithRawDetails = { recipe: Recipe; details: Omit<RecipeDetails, 'recipeId'>; ingredients: Ingredient[]; instructions: RecipeInstruction[] };

const SPOONACULAR_NUTRIENT_MAP: Record<string, keyof Omit<RecipeDetails, 'recipeId' | 'readyInMinutes' | 'servings' | 'stepCount' | 'ingredientCount' | 'pricePerServing' | 'effortScore' | 'rating' | 'aggregateLikes' | 'vegetarian' | 'vegan' | 'glutenFree' | 'dairyFree'>> = {
    'Calories': 'calories',
    'Carbohydrates': 'carbs',
    'Protein': 'protein',
    'Fat': 'fat',
    'Alcohol': 'alcohol',
    'Caffeine': 'caffeine',
    'Sugar': 'sugar',
    'Sodium': 'sodium',
    'Fiber': 'fiber',
    'Cholesterol': 'cholesterol',
    'Saturated Fat': 'saturatedFat',
    'Vitamin A': 'vitaminA',
    'Vitamin C': 'vitaminC',
    'Vitamin D': 'vitaminD',
    'Vitamin E': 'vitaminE',
    'Vitamin K': 'vitaminK',
    'Vitamin B1': 'vitaminB1',
    'Vitamin B2': 'vitaminB2',
    'Vitamin B3': 'vitaminB3',
    'Vitamin B5': 'vitaminB5',
    'Vitamin B6': 'vitaminB6',
    'Vitamin B12': 'vitaminB12',
    'Calcium': 'calcium',
    'Copper': 'copper',
    'Fluoride': 'fluoride',
    'Iodine': 'iodine',
    'Iron': 'iron',
    'Magnesium': 'magnesium',
    'Manganese': 'manganese',
    'Phosphorus': 'phosphorus',
    'Potassium': 'potassium',
    'Selenium': 'selenium',
    'Zinc': 'zinc',
    'Choline': 'choline',
    'Folate': 'folate',
    'Folic Acid': 'folicAcid',
};

export class RemoteRecipeRepository {
    private readonly API_URL = "https://api.spoonacular.com/recipes";
    private readonly API_KEY = process.env.SPOONACULAR_API_KEY || "key";

    async searchRecipes(query: string, userIp?: string, number: number = 4, filters: Record<string, any> = {}): Promise<RecipeWithRawDetails[]> {
        const params = new URLSearchParams();
        params.append("query", query);
        params.append("number", String(filters.number ?? number));
        params.append("addRecipeInformation", "true");
        params.append("addRecipeNutritionInformation", "true");
        params.append("fillIngredients", "true");
        params.append("apiKey", this.API_KEY);

        for (const [key, value] of Object.entries(filters)) {
            if (key !== "number" && value !== undefined && value !== "") {
                params.append(key, String(value));
            }
        }

        const url = `${this.API_URL}/complexSearch?${params.toString()}`;
        const response = await fetch(url);

        if (userIp) {
            const pointsUsed = parseInt(response.headers.get("X-API-Quota-Request") || "0", 10);
            updateQuota(userIp, pointsUsed);
        }

        if (!response.ok) {
            throw new Error(`Error fetching recipes: ${response.statusText}`);
        }

        const res = await response.json();
        return res.results.map((r: any) => ({
            recipe: { id: r.id, name: r.title, image: r.image, sourceName: r.sourceName ?? null, sourceUrl: r.sourceUrl ?? null },
            details: this.extractDetails(r),
            ingredients: this.extractIngredients(r),
            instructions: this.extractInstructions(r.analyzedInstructions ?? []),
        }));
    }

    async getRecipesByIds(ids: number[], userIp?: string): Promise<RecipeWithRawDetails[]> {
        if (ids.length === 0) return [];
        const url = `${this.API_URL}/informationBulk?ids=${ids.join(',')}&includeNutrition=true&apiKey=${this.API_KEY}`;
        const response = await fetch(url);

        if (userIp) {
            const pointsUsed = parseInt(response.headers.get("X-API-Quota-Request") || "0", 10);
            updateQuota(userIp, pointsUsed);
        }

        if (!response.ok) {
            throw new Error(`Error fetching bulk recipes: ${response.statusText}`);
        }

        const results: any[] = await response.json();
        return results.map((r: any) => ({
            recipe: { id: r.id, name: r.title, image: r.image, sourceName: r.sourceName ?? null, sourceUrl: r.sourceUrl ?? null },
            details: this.extractDetails(r),
            ingredients: this.extractIngredients(r),
            instructions: this.extractInstructions(r.analyzedInstructions ?? []),
        }));
    }

    async getRecipeById(id: number, userIp?: string): Promise<RecipeWithRawDetails | undefined> {
        const url = `${this.API_URL}/${id}/information?includeNutrition=true&apiKey=${this.API_KEY}`;
        const response = await fetch(url);

        if (userIp) {
            const pointsUsed = parseInt(response.headers.get("X-API-Quota-Request") || "0", 10);
            updateQuota(userIp, pointsUsed);
        }

        if (response.status === 404) {
            return undefined;
        }

        if (!response.ok) {
            throw new Error(`Error fetching recipe details: ${response.statusText}`);
        }

        const r = await response.json();
        return {
            recipe: { id: r.id, name: r.title, image: r.image, sourceName: r.sourceName ?? null, sourceUrl: r.sourceUrl ?? null },
            details: this.extractDetails(r),
            ingredients: this.extractIngredients(r),
            instructions: this.extractInstructions(r.analyzedInstructions ?? []),
        };
    }

    private extractIngredients(r: any): Ingredient[] {
        return (r.extendedIngredients ?? []).map((ing: any) => ({
            name: ing.nameClean ?? ing.name ?? '',
            amount: ing.amount ?? 0,
            unit: ing.unit ?? '',
            measures: {
                us: ing.measures?.us ? {
                    amount: ing.measures.us.amount ?? 0,
                    unitShort: ing.measures.us.unitShort ?? '',
                } : undefined,
                metric: ing.measures?.metric ? {
                    amount: ing.measures.metric.amount ?? 0,
                    unitShort: ing.measures.metric.unitShort ?? '',
                } : undefined,
            },
        }));
    }

    async getInstructions(id: number, userIp?: string): Promise<RecipeInstruction[]> {
        const url = `${this.API_URL}/${id}/analyzedInstructions?apiKey=${this.API_KEY}`;
        const response = await fetch(url);
        if (userIp) {
            const pointsUsed = parseInt(response.headers.get("X-API-Quota-Request") || "0", 10);
            updateQuota(userIp, pointsUsed);
        }
        if (!response.ok) {
            if (response.status === 404) return [];
            throw new Error(`Error fetching instructions: ${response.statusText}`);
        }
        const sections: any[] = await response.json();
        return this.extractInstructions(sections);
    }

    private extractInstructions(sections: any[]): RecipeInstruction[] {
        const result: RecipeInstruction[] = [];
        for (const section of sections ?? []) {
            const sectionName = section.name ?? '';
            for (const step of section.steps ?? []) {
                const lengthNum: number | null = step.length?.number ?? null;
                const lengthUnit: string = step.length?.unit ?? '';
                let lengthMinutes: number | null = null;
                if (lengthNum !== null) {
                    if (lengthUnit === 'minutes') lengthMinutes = lengthNum;
                    else if (lengthUnit === 'hours') lengthMinutes = lengthNum * 60;
                    else if (lengthUnit === 'seconds') lengthMinutes = Math.max(1, Math.ceil(lengthNum / 60));
                }
                const ingredients: RecipeStepIngredient[] = (step.ingredients ?? []).map((ing: any) => ({
                    id: ing.id ?? 0,
                    image: ing.image ?? '',
                    name: ing.name ?? '',
                }));
                const equipment: RecipeStepEquipment[] = (step.equipment ?? []).map((eq: any) => ({
                    id: eq.id ?? 0,
                    image: eq.image ?? '',
                    name: eq.name ?? '',
                    temperature: eq.temperature ? { number: eq.temperature.number, unit: eq.temperature.unit } : undefined,
                }));
                result.push({ sectionName, stepNumber: step.number ?? result.length + 1, stepText: step.step ?? '', lengthMinutes, ingredients, equipment });
            }
        }
        return result;
    }

    private extractNutrients(r: any): Record<string, number> {
        const result: Record<string, number> = {};
        const nutrientArray: Array<{ name: string; amount: number }> = r.nutrition?.nutrients ?? [];
        for (const nutrient of nutrientArray) {
            const field = SPOONACULAR_NUTRIENT_MAP[nutrient.name];
            if (field) result[field] = nutrient.amount ?? 0;
        }
        return result;
    }

    private extractDetails(r: any): Omit<RecipeDetails, 'recipeId'> {
        const stepCount = (r.analyzedInstructions ?? [])
            .reduce((sum: number, section: any) => sum + (section.steps?.length ?? 0), 0);
        const ingredientCount = r.extendedIngredients?.length ?? 0;
        const readyInMinutes = r.readyInMinutes ?? 0;
        const pricePerServing = r.pricePerServing ?? 0;
        const nutrients = this.extractNutrients(r);

        return {
            readyInMinutes,
            servings: r.servings ?? 0,
            stepCount,
            ingredientCount,
            pricePerServing,
            effortScore: calculateEffortScore(readyInMinutes, stepCount, ingredientCount, pricePerServing),
            rating: Math.max(1, Math.min(5, Math.round((r.spoonacularScore ?? 0) / 20))),
            aggregateLikes: r.aggregateLikes ?? 0,
            vegetarian: r.vegetarian ?? false,
            vegan: r.vegan ?? false,
            glutenFree: r.glutenFree ?? false,
            dairyFree: r.dairyFree ?? false,
            calories: nutrients.calories ?? 0,
            carbs: nutrients.carbs ?? 0,
            protein: nutrients.protein ?? 0,
            fat: nutrients.fat ?? 0,
            alcohol: nutrients.alcohol ?? 0,
            caffeine: nutrients.caffeine ?? 0,
            sugar: nutrients.sugar ?? 0,
            sodium: nutrients.sodium ?? 0,
            fiber: nutrients.fiber ?? 0,
            cholesterol: nutrients.cholesterol ?? 0,
            saturatedFat: nutrients.saturatedFat ?? 0,
            vitaminA: nutrients.vitaminA ?? 0,
            vitaminC: nutrients.vitaminC ?? 0,
            vitaminD: nutrients.vitaminD ?? 0,
            vitaminE: nutrients.vitaminE ?? 0,
            vitaminK: nutrients.vitaminK ?? 0,
            vitaminB1: nutrients.vitaminB1 ?? 0,
            vitaminB2: nutrients.vitaminB2 ?? 0,
            vitaminB3: nutrients.vitaminB3 ?? 0,
            vitaminB5: nutrients.vitaminB5 ?? 0,
            vitaminB6: nutrients.vitaminB6 ?? 0,
            vitaminB12: nutrients.vitaminB12 ?? 0,
            calcium: nutrients.calcium ?? 0,
            copper: nutrients.copper ?? 0,
            fluoride: nutrients.fluoride ?? 0,
            iodine: nutrients.iodine ?? 0,
            iron: nutrients.iron ?? 0,
            magnesium: nutrients.magnesium ?? 0,
            manganese: nutrients.manganese ?? 0,
            phosphorus: nutrients.phosphorus ?? 0,
            potassium: nutrients.potassium ?? 0,
            selenium: nutrients.selenium ?? 0,
            zinc: nutrients.zinc ?? 0,
            choline: nutrients.choline ?? 0,
            folate: nutrients.folate ?? 0,
            folicAcid: nutrients.folicAcid ?? 0,
        };
    }
}
