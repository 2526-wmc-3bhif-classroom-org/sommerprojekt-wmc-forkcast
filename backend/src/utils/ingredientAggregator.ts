import { CachedIngredient } from './ingredientCache';

export type UnitSystem = 'us' | 'metric' | 'both';

interface AggregatedIngredient {
    name: string;
    us?: { amount: number; unit: string };
    metric?: { amount: number; unit: string };
}

export class IngredientAggregator {
    aggregate(ingredients: CachedIngredient[], units: UnitSystem = 'metric'): AggregatedIngredient[] {
        const aggregated = new Map<string, AggregatedIngredient>();

        for (const ingredient of ingredients) {
            const key = ingredient.name.toLowerCase();

            if (!aggregated.has(key)) {
                aggregated.set(key, { name: ingredient.name });
            }

            const existing = aggregated.get(key)!;

            if (units === 'us' || units === 'both') {
                if (ingredient.measures?.us) {
                    if (!existing.us) {
                        existing.us = { amount: 0, unit: ingredient.measures.us.unitShort };
                    }
                    existing.us.amount += ingredient.measures.us.amount;
                } else if (ingredient.unit && !ingredient.measures?.metric) {
                    // Fallback to original if no measures
                    if (!existing.us) {
                        existing.us = { amount: 0, unit: ingredient.unit };
                    }
                    existing.us.amount += ingredient.amount;
                }
            }

            if (units === 'metric' || units === 'both') {
                if (ingredient.measures?.metric) {
                    if (!existing.metric) {
                        existing.metric = { amount: 0, unit: ingredient.measures.metric.unitShort };
                    }
                    existing.metric.amount += ingredient.measures.metric.amount;
                } else if (ingredient.unit && !ingredient.measures?.us) {
                    // Fallback to original if no measures
                    if (!existing.metric) {
                        existing.metric = { amount: 0, unit: ingredient.unit };
                    }
                    existing.metric.amount += ingredient.amount;
                }
            }
        }

        // Sort alphabetically by name and return
        return Array.from(aggregated.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }
}
