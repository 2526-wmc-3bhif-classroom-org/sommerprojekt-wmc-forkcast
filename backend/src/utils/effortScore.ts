const EFFORT_TIME_WEIGHT = 40;
const EFFORT_STEPS_WEIGHT = 40;
const EFFORT_INGREDIENTS_WEIGHT = 20;
const EFFORT_TIME_MAX_MINUTES = 120;
const EFFORT_STEPS_MAX = 20;
const EFFORT_INGREDIENTS_MAX = 20;

export function calculateEffortScore(
    readyInMinutes: number,
    stepCount: number,
    ingredientCount: number
): number {
    const timeFactor = Math.min(readyInMinutes / EFFORT_TIME_MAX_MINUTES, 1) * EFFORT_TIME_WEIGHT;
    const stepsFactor = Math.min(stepCount / EFFORT_STEPS_MAX, 1) * EFFORT_STEPS_WEIGHT;
    const ingredientsFactor = Math.min(ingredientCount / EFFORT_INGREDIENTS_MAX, 1) * EFFORT_INGREDIENTS_WEIGHT;
    return Math.max(1, Math.min(100, Math.round(timeFactor + stepsFactor + ingredientsFactor)));
}
