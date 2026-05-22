import useApiConnection, { type ApiResponse } from "~/assets/util/api-connector";
import useAuthService from "~/assets/service/auth-service";
import type { RecipePreview } from "~/assets/model/recipe-preview";
import type { FiltersResponse } from "~/assets/model/filter";

export default function useRecipeService() {
    const connection = useApiConnection();
    const auth = useAuthService();

    async function search(query: string, filters: Record<string, string> = {}): Promise<ApiResponse<RecipePreview[]>> {
        if (!auth.authenticated.value) throw Error("Not authenticated");

        const params = new URLSearchParams({ search: query, ...filters });
        const result = await connection
            .apiRequest<RecipePreview[]>(`/recipes?${params}`, "GET", auth.jwt.value);

        if (result.needsAuth) await auth.logout();
        return result;
    }

    async function getRecipe(id: number): Promise<ApiResponse<RecipePreview>> {
        if (!auth.authenticated.value) throw Error("Not authenticated");

        const result = await connection
            .apiRequest<RecipePreview>(`/recipes/${id}`, "GET", auth.jwt.value);

        if (result.needsAuth) await auth.logout();
        return result;
    }

    async function getFilters(): Promise<ApiResponse<FiltersResponse>> {
        if (!auth.authenticated.value) throw Error("Not authenticated");

        const result = await connection
            .apiRequest<FiltersResponse>("/recipes/filters", "GET", auth.jwt.value);

        if (result.needsAuth) await auth.logout();
        return result;
    }

    return { search, getRecipe, getFilters };
}
