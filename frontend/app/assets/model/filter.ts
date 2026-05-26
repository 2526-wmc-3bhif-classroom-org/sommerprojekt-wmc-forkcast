export type FilterOption = {
    name: string;
    pretty_name: string;
    type: 'number' | 'string' | 'boolean' | 'range';
    min?: number;
    max?: number;
};

export type FilterGroup = {
    icon: string;
    options: Record<string, FilterOption>;
};

export type FiltersResponse = {
    filters: Record<string, FilterGroup>;
};
