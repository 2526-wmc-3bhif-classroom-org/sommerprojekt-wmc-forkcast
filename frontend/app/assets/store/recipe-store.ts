import useApiConnection, { type ApiResponse } from '~/assets/util/api-connector';
import { useAuthStore } from '~/assets/store/auth-store';
import type { RecipePreview } from '~/assets/model/recipe-preview';
import type { FiltersResponse } from '~/assets/model/filter';

function searchKey(query: string, filters: Record<string, string>): string {
  const sorted = Object.keys(filters).sort().map(k => `${k}=${filters[k]}`).join('&');
  return `${query}|${sorted}`;
}

const NOT_AUTH: ApiResponse<never> = { ok: false, needsAuth: true, rateLimited: false };

export const useRecipeStore = defineStore('recipeStore', () => {
  const { apiRequest } = useApiConnection();
  const authStore = useAuthStore();

  const byId = reactive<Record<number, RecipePreview>>({});
  const bySearch = reactive<Record<string, RecipePreview[]>>({});
  const filtersCache = ref<FiltersResponse | null>(null);

  const inflightById = new Map<number, Promise<ApiResponse<RecipePreview>>>();
  const inflightSearch = new Map<string, Promise<ApiResponse<RecipePreview[]>>>();

  const authenticated = computed(() => !authStore.loading && authStore.jwt !== undefined);

  function populate(recipes: RecipePreview[]) {
    for (const r of recipes) byId[r.id] = r;
  }

  async function logout() {
    authStore.user = undefined;
    authStore.jwt = undefined;
  }

  async function getRecipe(id: number): Promise<ApiResponse<RecipePreview>> {
    if (!authenticated.value) return NOT_AUTH;
    if (byId[id]) return { ok: true, needsAuth: false, rateLimited: false, value: byId[id] };
    if (inflightById.has(id)) return inflightById.get(id)!;

    const promise = apiRequest<RecipePreview>(`/recipes/${id}`, 'GET', authStore.jwt).then(r => {
      inflightById.delete(id);
      if (r.needsAuth) logout();
      if (r.ok && r.value) byId[r.value.id] = r.value;
      return r;
    });

    inflightById.set(id, promise);
    return promise;
  }

  async function search(query: string, filters: Record<string, string> = {}): Promise<ApiResponse<RecipePreview[]>> {
    if (!authenticated.value) return NOT_AUTH;
    const key = searchKey(query, filters);
    if (bySearch[key]) return { ok: true, needsAuth: false, rateLimited: false, value: bySearch[key] };
    if (inflightSearch.has(key)) return inflightSearch.get(key)!;

    const params = new URLSearchParams({ search: query, ...filters });
    const promise = apiRequest<RecipePreview[]>(`/recipes?${params}`, 'GET', authStore.jwt).then(r => {
      inflightSearch.delete(key);
      if (r.needsAuth) logout();
      if (r.ok && r.value) { populate(r.value); bySearch[key] = r.value; }
      return r;
    });

    inflightSearch.set(key, promise);
    return promise;
  }

  async function getFilters(): Promise<ApiResponse<FiltersResponse>> {
    if (!authenticated.value) return NOT_AUTH;
    if (filtersCache.value) return { ok: true, needsAuth: false, rateLimited: false, value: filtersCache.value };
    const r = await apiRequest<FiltersResponse>('/recipes/filters', 'GET', authStore.jwt);
    if (r.needsAuth) await logout();
    if (r.ok && r.value) filtersCache.value = r.value;
    return r;
  }

  return { byId, bySearch, filtersCache, getRecipe, search, getFilters };
});
