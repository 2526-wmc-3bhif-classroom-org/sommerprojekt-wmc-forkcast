import useApiConnection, {type ApiResponse} from "~/assets/util/api-connector";
import useAuthService from "~/assets/service/auth-service";
import type {RecipeResponse} from "~/assets/model/recipe-response";


export default function useRecipeService() {
    const connection = useApiConnection();
    const auth = useAuthService();

    async function search(query: string): Promise<ApiResponse<RecipeResponse>> {
        if (!auth.authenticated.value) throw Error("Not authenticated");

        const params = new URLSearchParams({ search: query });
        const result = await connection
            .apiRequest<RecipeResponse>(`/recipes?${params}`, "GET", auth.jwt.value);

        if (result.needsAuth) {
            await auth.logout();
        }

        return result;
    }

    async function getRecipe(id: string): Promise<ApiResponse<RecipeResponse>> {
        if (!auth.authenticated.value) throw Error("Not authenticated");
        const result = await connection
            .apiRequest<RecipeResponse>(`/recipes/${id}`, "GET", auth.jwt.value);

        if (result.needsAuth) {
            await auth.logout();
        }

        return result;
    }

    return {
        search,
        getRecipe
    }
}
