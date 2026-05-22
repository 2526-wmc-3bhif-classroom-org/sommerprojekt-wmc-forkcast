import { Unit } from "../db/unit";

interface FilterConfig {
    name: string;
    type: string;
    min?: number;
    max?: number;
}

interface RangeFieldConfig {
    minApi: string;
    maxApi: string;
    min: number;
    max: number;
}

const RANGE_FIELDS: Record<string, RangeFieldConfig> = {
    calories: { minApi: "minCalories", maxApi: "maxCalories", min: 0, max: 1000 },
    carbs: { minApi: "minCarbs", maxApi: "maxCarbs", min: 0, max: 200 },
    protein: { minApi: "minProtein", maxApi: "maxProtein", min: 0, max: 200 },
    fat: { minApi: "minFat", maxApi: "maxFat", min: 0, max: 200 },
    alcohol: { minApi: "minAlcohol", maxApi: "maxAlcohol", min: 0, max: 100 },
    caffeine: { minApi: "minCaffeine", maxApi: "maxCaffeine", min: 0, max: 500 },
    sugar: { minApi: "minSugar", maxApi: "maxSugar", min: 0, max: 200 },
    sodium: { minApi: "minSodium", maxApi: "maxSodium", min: 0, max: 5000 },
    fiber: { minApi: "minFiber", maxApi: "maxFiber", min: 0, max: 100 },
    cholesterol: { minApi: "minCholesterol", maxApi: "maxCholesterol", min: 0, max: 500 },
    saturatedFat: { minApi: "minSaturatedFat", maxApi: "maxSaturatedFat", min: 0, max: 100 },
    vitaminA: { minApi: "minVitaminA", maxApi: "maxVitaminA", min: 0, max: 10000 },
    vitaminC: { minApi: "minVitaminC", maxApi: "maxVitaminC", min: 0, max: 500 },
    vitaminD: { minApi: "minVitaminD", maxApi: "maxVitaminD", min: 0, max: 100 },
    vitaminE: { minApi: "minVitaminE", maxApi: "maxVitaminE", min: 0, max: 100 },
    vitaminK: { minApi: "minVitaminK", maxApi: "maxVitaminK", min: 0, max: 500 },
    vitaminB1: { minApi: "minVitaminB1", maxApi: "maxVitaminB1", min: 0, max: 10 },
    vitaminB2: { minApi: "minVitaminB2", maxApi: "maxVitaminB2", min: 0, max: 10 },
    vitaminB3: { minApi: "minVitaminB3", maxApi: "maxVitaminB3", min: 0, max: 100 },
    vitaminB5: { minApi: "minVitaminB5", maxApi: "maxVitaminB5", min: 0, max: 100 },
    vitaminB6: { minApi: "minVitaminB6", maxApi: "maxVitaminB6", min: 0, max: 100 },
    vitaminB12: { minApi: "minVitaminB12", maxApi: "maxVitaminB12", min: 0, max: 100 },
    calcium: { minApi: "minCalcium", maxApi: "maxCalcium", min: 0, max: 2000 },
    copper: { minApi: "minCopper", maxApi: "maxCopper", min: 0, max: 10 },
    fluoride: { minApi: "minFluoride", maxApi: "maxFluoride", min: 0, max: 10 },
    iodine: { minApi: "minIodine", maxApi: "maxIodine", min: 0, max: 500 },
    iron: { minApi: "minIron", maxApi: "maxIron", min: 0, max: 100 },
    magnesium: { minApi: "minMagnesium", maxApi: "maxMagnesium", min: 0, max: 1000 },
    manganese: { minApi: "minManganese", maxApi: "maxManganese", min: 0, max: 100 },
    phosphorus: { minApi: "minPhosphorus", maxApi: "maxPhosphorus", min: 0, max: 2000 },
    potassium: { minApi: "minPotassium", maxApi: "maxPotassium", min: 0, max: 5000 },
    selenium: { minApi: "minSelenium", maxApi: "maxSelenium", min: 0, max: 500 },
    zinc: { minApi: "minZinc", maxApi: "maxZinc", min: 0, max: 100 },
    choline: { minApi: "minCholine", maxApi: "maxCholine", min: 0, max: 1000 },
    folate: { minApi: "minFolate", maxApi: "maxFolate", min: 0, max: 1000 },
    folicAcid: { minApi: "minFolicAcid", maxApi: "maxFolicAcid", min: 0, max: 1000 },
    servings: { minApi: "minServings", maxApi: "maxServings", min: 1, max: 100 },
};

export class FilterValidator {
    private filterConfigs: Map<string, FilterConfig> = new Map();

    constructor() {
        this.loadFilterConfigs();
    }

    private loadFilterConfigs(): void {
        const unit = new Unit(true);
        try {
            const filters = unit.prepare<{ name: string; type: string; min: number | null; max: number | null }>(
                "SELECT name, type, min, max FROM Filter"
            ).all();

            for (const filter of filters) {
                this.filterConfigs.set(filter.name, {
                    name: filter.name,
                    type: filter.type,
                    min: filter.min ?? undefined,
                    max: filter.max ?? undefined,
                });
            }

            unit.complete();
        } catch (error) {
            unit.complete();
            throw error;
        }
    }

    validateAndBuild(queryParams: Record<string, any>): Record<string, any> {
        const validated: Record<string, any> = {};

        for (const [key, value] of Object.entries(queryParams)) {
            if (value === undefined || value === "") continue;

            const config = this.filterConfigs.get(key);
            if (!config) continue;

            if (config.type === "range") {
                this.decodeRangeField(key, value as string, validated);
            } else if (config.type === "number") {
                const num = Number(value);
                if (isNaN(num)) continue;

                if (config.min !== undefined && num < config.min) continue;
                if (config.max !== undefined && num > config.max) continue;

                validated[key] = num;
            } else if (config.type === "string" || config.type === "boolean") {
                validated[key] = value;
            }
        }

        return validated;
    }

    private decodeRangeField(fieldName: string, rangeString: string, validated: Record<string, any>): void {
        const config = RANGE_FIELDS[fieldName];
        if (!config) return;

        const parts = rangeString.split("-");
        if (parts.length < 1 || parts.length > 2) return;

        let minVal = config.min;
        let maxVal = config.max;

        // Parse min value (first part)
        if (parts[0] !== "") {
            const min = Number(parts[0]);
            if (!isNaN(min)) {
                minVal = Math.max(min, config.min);
            }
        }

        // Parse max value (second part or same part after dash)
        if (parts.length === 2 && parts[1] !== "") {
            const max = Number(parts[1]);
            if (!isNaN(max)) {
                maxVal = Math.min(max, config.max);
            }
        }

        // Swap if reversed
        if (minVal > maxVal) {
            [minVal, maxVal] = [maxVal, minVal];
        }

        validated[config.minApi] = minVal;
        validated[config.maxApi] = maxVal;
    }
}
