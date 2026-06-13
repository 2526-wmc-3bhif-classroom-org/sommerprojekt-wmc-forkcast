import useApiConnection, { type ApiResponse } from '~/assets/util/api-connector';
import { useAuthStore } from '~/assets/store/auth-store';
import type { RecipePreview } from '~/assets/model/recipe-preview';
import type { FavoritesResponse } from '~/assets/model/favorites-response';

export const useFavoritesStore = defineStore('favoritesStore', () => {
  const { apiRequest } = useApiConnection();
  const authStore = useAuthStore();

  const ids = ref<Set<number>>(new Set());
  const seeded = ref<Set<number>>(new Set());
  const loaded = ref(false);

  //TODO: remove this when recipe payload contains fav state, this is only
  //TODO: really used in the cards to know if they are favorite
  async function load() {
    if (loaded.value) return;
    const result = await apiRequest<FavoritesResponse>('/users/me/favorites', 'GET', authStore.jwt);
    if (result.ok && result.value) {
      ids.value = new Set(result.value.foods.map(f => f.recipeId));
      loaded.value = true;
    }
  }

  function has(recipeId: number) {
    return ids.value.has(recipeId);
  }

  function seedFromPayload(recipeId: number, isFavorited: boolean) {
    if (isFavorited) ids.value.add(recipeId);
    else ids.value.delete(recipeId);
    seeded.value.add(recipeId);
  }

  async function toggle(recipeId: number) {
    if (!loaded.value && !seeded.value.has(recipeId)) await load();
    if (ids.value.has(recipeId)) {
      const result = await apiRequest(`/users/me/favorites/${recipeId}`, 'DELETE', authStore.jwt);
      if (result.ok) ids.value.delete(recipeId);
    } else {
      const result = await apiRequest('/users/me/favorites', 'POST', authStore.jwt, { recipeId });
      if (result.ok) ids.value.add(recipeId);
    }
  }

  async function getPopulated(offset: number, limit: number): Promise<ApiResponse<{ count: number; recipes: RecipePreview[] }>> {
    if (!authStore.jwt) return { ok: false, needsAuth: true, rateLimited: false };
    const result = await apiRequest<FavoritesResponse>(
      `/users/me/favorites?populate=true&offset=${offset}&limit=${limit}`,
      'GET',
      authStore.jwt
    );
    if (!result.ok || !result.value) return { ok: false, needsAuth: result.needsAuth, rateLimited: result.rateLimited };

    const recipes = result.value.foods
      .filter(item => item.recipe !== null)
      .map(item => item.recipe as RecipePreview);
    
    return {
      ok: true,
      needsAuth: false,
      rateLimited: false,
      value: {
        count: result.value.count,
        recipes
      }
    };
  }

  return { ids, loaded, load, has, seedFromPayload, toggle, getPopulated };
})

