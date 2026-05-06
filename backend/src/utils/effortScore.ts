const EFFORT_BASE = 5;

const EFFORT_TIME_WEIGHT = 55;
const EFFORT_TIME_MAX_MINUTES = 90;

const EFFORT_STEPS_WEIGHT = 15;
const EFFORT_STEPS_MAX = 12;

const EFFORT_INGREDIENTS_WEIGHT = 10;
const EFFORT_INGREDIENTS_MAX = 15;

// pricePerServing is in US cents (e.g. 300 = $3.00)
const EFFORT_PRICE_WEIGHT = 15;
const EFFORT_PRICE_MAX_CENTS = 1000;

export function calculateEffortScore(
    readyInMinutes: number,
    stepCount: number,
    ingredientCount: number,
    pricePerServing: number
): number {
    const timeFactor        = Math.min(readyInMinutes  / EFFORT_TIME_MAX_MINUTES,  1) * EFFORT_TIME_WEIGHT;
    const stepsFactor       = Math.min(stepCount       / EFFORT_STEPS_MAX,         1) * EFFORT_STEPS_WEIGHT;
    const ingredientsFactor = Math.min(ingredientCount / EFFORT_INGREDIENTS_MAX,   1) * EFFORT_INGREDIENTS_WEIGHT;
    const priceFactor       = Math.min(pricePerServing / EFFORT_PRICE_MAX_CENTS,   1) * EFFORT_PRICE_WEIGHT;

    return Math.max(1, Math.min(100, Math.round(
        (EFFORT_BASE + timeFactor + stepsFactor + ingredientsFactor + priceFactor) * 1.25
    )));
}
