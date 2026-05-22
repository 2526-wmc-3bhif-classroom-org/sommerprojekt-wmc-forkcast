import { Unit } from "../db/unit";

interface FilterConfig {
    name: string;
    type: string;
    min?: number;
    max?: number;
}

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
            const config = this.filterConfigs.get(key);
            if (!config || value === undefined || value === "") continue;

            if (config.type === "number") {
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
}
