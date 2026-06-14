import { getFilterCache } from "../utils/filterCache";

interface FiltersResponse {
    filters: Record<string, Record<string, any>>;
}

export class FilterRepository {
    getFiltersStructured(): FiltersResponse {
        return getFilterCache();
    }
}
