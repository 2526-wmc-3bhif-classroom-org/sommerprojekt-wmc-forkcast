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
            { name: "calories", prettyName: "Calories", type: "range", min: 0, max: 1000 },
            { name: "carbs", prettyName: "Carbs", type: "range", min: 0, max: 200 },
            { name: "protein", prettyName: "Protein", type: "range", min: 0, max: 200 },
            { name: "fat", prettyName: "Fat", type: "range", min: 0, max: 200 },
            { name: "alcohol", prettyName: "Alcohol", type: "range", min: 0, max: 100 },
            { name: "caffeine", prettyName: "Caffeine", type: "range", min: 0, max: 500 },
            { name: "sugar", prettyName: "Sugar", type: "range", min: 0, max: 200 },
            { name: "sodium", prettyName: "Sodium", type: "range", min: 0, max: 5000 },
            { name: "fiber", prettyName: "Fiber", type: "range", min: 0, max: 100 },
            { name: "cholesterol", prettyName: "Cholesterol", type: "range", min: 0, max: 500 },
            { name: "saturatedFat", prettyName: "Saturated Fat", type: "range", min: 0, max: 100 },
            { name: "vitaminA", prettyName: "Vitamin A", type: "range", min: 0, max: 10000 },
            { name: "vitaminC", prettyName: "Vitamin C", type: "range", min: 0, max: 500 },
            { name: "vitaminD", prettyName: "Vitamin D", type: "range", min: 0, max: 100 },
            { name: "vitaminE", prettyName: "Vitamin E", type: "range", min: 0, max: 100 },
            { name: "vitaminK", prettyName: "Vitamin K", type: "range", min: 0, max: 500 },
            { name: "vitaminB1", prettyName: "Vitamin B1", type: "range", min: 0, max: 10 },
            { name: "vitaminB2", prettyName: "Vitamin B2", type: "range", min: 0, max: 10 },
            { name: "vitaminB3", prettyName: "Vitamin B3", type: "range", min: 0, max: 100 },
            { name: "vitaminB5", prettyName: "Vitamin B5", type: "range", min: 0, max: 100 },
            { name: "vitaminB6", prettyName: "Vitamin B6", type: "range", min: 0, max: 100 },
            { name: "vitaminB12", prettyName: "Vitamin B12", type: "range", min: 0, max: 100 },
            { name: "calcium", prettyName: "Calcium", type: "range", min: 0, max: 2000 },
            { name: "copper", prettyName: "Copper", type: "range", min: 0, max: 10 },
            { name: "fluoride", prettyName: "Fluoride", type: "range", min: 0, max: 10 },
            { name: "iodine", prettyName: "Iodine", type: "range", min: 0, max: 500 },
            { name: "iron", prettyName: "Iron", type: "range", min: 0, max: 100 },
            { name: "magnesium", prettyName: "Magnesium", type: "range", min: 0, max: 1000 },
            { name: "manganese", prettyName: "Manganese", type: "range", min: 0, max: 100 },
            { name: "phosphorus", prettyName: "Phosphorus", type: "range", min: 0, max: 2000 },
            { name: "potassium", prettyName: "Potassium", type: "range", min: 0, max: 5000 },
            { name: "selenium", prettyName: "Selenium", type: "range", min: 0, max: 500 },
            { name: "zinc", prettyName: "Zinc", type: "range", min: 0, max: 100 },
            { name: "choline", prettyName: "Choline", type: "range", min: 0, max: 1000 },
            { name: "folate", prettyName: "Folate", type: "range", min: 0, max: 1000 },
            { name: "folicAcid", prettyName: "Folic Acid", type: "range", min: 0, max: 1000 },
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
            { name: "maxReadyTime", prettyName: "Max Ready Time", type: "number", min: 0, max: 1440 },
            { name: "servings", prettyName: "Servings", type: "range", min: 1, max: 100 },
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
