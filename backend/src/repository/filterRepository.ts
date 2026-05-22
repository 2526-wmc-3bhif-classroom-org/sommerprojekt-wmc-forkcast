import { Unit } from "../db/unit";

interface FilterOption {
    name: string;
    pretty_name: string;
    type: string;
    min?: number;
    max?: number;
}

interface FilterGroup {
    pretty_name: string;
    icon: string;
    options: Record<string, FilterOption>;
}

interface FiltersResponse {
    filters: Record<string, FilterGroup>;
}

export class FilterRepository {
    getFiltersStructured(): FiltersResponse {
        const unit = new Unit(true);
        try {
            const groups = unit.prepare<{ id: number; name: string; icon: string }>(
                "SELECT id, name, icon FROM FilterGroup ORDER BY id"
            ).all();

            const filters = unit.prepare<{ id: number; groupId: number; name: string; prettyName: string; type: string; min: number | null; max: number | null }>(
                "SELECT id, groupId, name, prettyName, type, min, max FROM Filter ORDER BY groupId, id"
            ).all();

            const result: FiltersResponse = { filters: {} };

            for (const group of groups) {
                const groupFilters = filters.filter(f => f.groupId === group.id);
                const options: Record<string, FilterOption> = {};

                for (const filter of groupFilters) {
                    const option: FilterOption = {
                        name: filter.name,
                        pretty_name: filter.prettyName,
                        type: filter.type,
                    };
                    if (filter.min !== null) option.min = filter.min;
                    if (filter.max !== null) option.max = filter.max;

                    options[filter.name] = option;
                }

                result.filters[group.name] = {
                    pretty_name: this.formatGroupName(group.name),
                    icon: group.icon,
                    options,
                };
            }

            unit.complete();
            return result;
        } catch (error) {
            unit.complete();
            throw error;
        }
    }

    private formatGroupName(name: string): string {
        return name.split(/(?=[A-Z])/).join(" ");
    }
}
