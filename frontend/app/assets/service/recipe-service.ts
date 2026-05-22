import useApiConnection, { type ApiResponse } from "~/assets/util/api-connector";
import useAuthService from "~/assets/service/auth-service";
import type { RecipePreview } from "~/assets/model/recipe-preview";

export default function useRecipeService() {
    const connection = useApiConnection();
    const auth = useAuthService();

    async function search(query: string): Promise<ApiResponse<RecipePreview[]>> {
        if (!auth.authenticated.value) throw Error("Not authenticated");

        const params = new URLSearchParams({ search: query });
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

    return { search, getRecipe };
}
