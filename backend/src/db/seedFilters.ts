import { Unit } from "./unit";

interface FilterData {
    groupName: string;
    icon: string;
    filters: Array<{ name: string; prettyName: string; type: string; min?: number; max?: number }>;
}

const FILTERS: FilterData[] = [
    {
        groupName: "Nutrition",
        icon: "fa-apple",
        filters: [
            { name: "minCalories", prettyName: "Min Calories", type: "number", min: 0, max: 1000 },
            { name: "maxCalories", prettyName: "Max Calories", type: "number", min: 0, max: 1000 },
            { name: "minCarbs", prettyName: "Min Carbs (g)", type: "number", min: 0, max: 200 },
            { name: "maxCarbs", prettyName: "Max Carbs (g)", type: "number", min: 0, max: 200 },
            { name: "minProtein", prettyName: "Min Protein (g)", type: "number", min: 0, max: 200 },
            { name: "maxProtein", prettyName: "Max Protein (g)", type: "number", min: 0, max: 200 },
            { name: "minFat", prettyName: "Min Fat (g)", type: "number", min: 0, max: 200 },
            { name: "maxFat", prettyName: "Max Fat (g)", type: "number", min: 0, max: 200 },
            { name: "minAlcohol", prettyName: "Min Alcohol (g)", type: "number", min: 0, max: 100 },
            { name: "maxAlcohol", prettyName: "Max Alcohol (g)", type: "number", min: 0, max: 100 },
            { name: "minCaffeine", prettyName: "Min Caffeine (mg)", type: "number", min: 0, max: 500 },
            { name: "maxCaffeine", prettyName: "Max Caffeine (mg)", type: "number", min: 0, max: 500 },
            { name: "minSugar", prettyName: "Min Sugar (g)", type: "number", min: 0, max: 200 },
            { name: "maxSugar", prettyName: "Max Sugar (g)", type: "number", min: 0, max: 200 },
            { name: "minSodium", prettyName: "Min Sodium (mg)", type: "number", min: 0, max: 5000 },
            { name: "maxSodium", prettyName: "Max Sodium (mg)", type: "number", min: 0, max: 5000 },
            { name: "minFiber", prettyName: "Min Fiber (g)", type: "number", min: 0, max: 100 },
            { name: "maxFiber", prettyName: "Max Fiber (g)", type: "number", min: 0, max: 100 },
            { name: "minCholesterol", prettyName: "Min Cholesterol (mg)", type: "number", min: 0, max: 500 },
            { name: "maxCholesterol", prettyName: "Max Cholesterol (mg)", type: "number", min: 0, max: 500 },
            { name: "minSaturatedFat", prettyName: "Min Saturated Fat (g)", type: "number", min: 0, max: 100 },
            { name: "maxSaturatedFat", prettyName: "Max Saturated Fat (g)", type: "number", min: 0, max: 100 },
            { name: "minVitaminA", prettyName: "Min Vitamin A (IU)", type: "number", min: 0, max: 10000 },
            { name: "maxVitaminA", prettyName: "Max Vitamin A (IU)", type: "number", min: 0, max: 10000 },
            { name: "minVitaminC", prettyName: "Min Vitamin C (mg)", type: "number", min: 0, max: 500 },
            { name: "maxVitaminC", prettyName: "Max Vitamin C (mg)", type: "number", min: 0, max: 500 },
            { name: "minVitaminD", prettyName: "Min Vitamin D (µg)", type: "number", min: 0, max: 100 },
            { name: "maxVitaminD", prettyName: "Max Vitamin D (µg)", type: "number", min: 0, max: 100 },
            { name: "minVitaminE", prettyName: "Min Vitamin E (mg)", type: "number", min: 0, max: 100 },
            { name: "maxVitaminE", prettyName: "Max Vitamin E (mg)", type: "number", min: 0, max: 100 },
            { name: "minVitaminK", prettyName: "Min Vitamin K (µg)", type: "number", min: 0, max: 500 },
            { name: "maxVitaminK", prettyName: "Max Vitamin K (µg)", type: "number", min: 0, max: 500 },
            { name: "minVitaminB1", prettyName: "Min Vitamin B1 (mg)", type: "number", min: 0, max: 10 },
            { name: "maxVitaminB1", prettyName: "Max Vitamin B1 (mg)", type: "number", min: 0, max: 10 },
        ]
    },
    {
        groupName: "Dietary",
        icon: "fa-leaf",
        filters: [
            { name: "diet", prettyName: "Diet", type: "string" },
            { name: "intolerances", prettyName: "Intolerances", type: "string" },
        ]
    },
    {
        groupName: "Time & Servings",
        icon: "fa-clock",
        filters: [
            { name: "maxReadyTime", prettyName: "Max Ready Time (min)", type: "number", min: 0, max: 1440 },
            { name: "minServings", prettyName: "Min Servings", type: "number", min: 1, max: 100 },
            { name: "maxServings", prettyName: "Max Servings", type: "number", min: 1, max: 100 },
        ]
    },
    {
        groupName: "Ingredients",
        icon: "fa-carrot",
        filters: [
            { name: "includeIngredients", prettyName: "Include Ingredients", type: "string" },
            { name: "excludeIngredients", prettyName: "Exclude Ingredients", type: "string" },
        ]
    },
    {
        groupName: "Equipment & Type",
        icon: "fa-utensils",
        filters: [
            { name: "equipment", prettyName: "Equipment", type: "string" },
            { name: "type", prettyName: "Meal Type", type: "string" },
            { name: "cuisine", prettyName: "Cuisine", type: "string" },
            { name: "excludeCuisine", prettyName: "Exclude Cuisine", type: "string" },
            { name: "number", prettyName: "Number of Results", type: "number", min: 1, max: 100 },
        ]
    },
];

export async function seedFilters(): Promise<void> {
    const unit = new Unit(false);
    try {
        for (const groupData of FILTERS) {
            const groupStmt = unit.prepare<{ id: number }, { name: string; icon: string }>(
                "INSERT INTO FilterGroup (name, icon) VALUES (:name, :icon)",
                { name: groupData.groupName, icon: groupData.icon }
            );
            groupStmt.run();
            const groupId = unit.getLastRowId();

            for (const filter of groupData.filters) {
                const filterStmt = unit.prepare<unknown, any>(
                    "INSERT INTO Filter (groupId, name, prettyName, type, min, max) VALUES (:groupId, :name, :prettyName, :type, :min, :max)",
                    {
                        groupId,
                        name: filter.name,
                        prettyName: filter.prettyName,
                        type: filter.type,
                        min: filter.min ?? null,
                        max: filter.max ?? null,
                    }
                );
                filterStmt.run();
            }
        }
        unit.complete(true);
    } catch (error) {
        unit.complete(false);
        throw error;
    }
}
