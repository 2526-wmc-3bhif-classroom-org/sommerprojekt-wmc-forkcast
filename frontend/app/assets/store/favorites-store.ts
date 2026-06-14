import useApiConnection, { type ApiResponse } from '~/assets/util/api-connector';
import { useAuthStore } from '~/assets/store/auth-store';
import type { RecipePreview } from '~/assets/model/recipe-preview';
import type { FavoritesResponse } from '~/assets/model/favorites-response';

export const useFavoritesStore = defineStore('favoritesStore', () => {
  const { apiRequest } = useApiConnection();
  const authStore = useAuthStore();

  // Recipe ids the current user has favorited. Seeded from the isFavorited flag
  // that ships with recipe payloads, so hearts across the app stay reactive.
  const ids = ref<Set<number>>(new Set());

  function has(recipeId: number) {
    return ids.value.has(recipeId);
  }

  // Drop cached favorite state so a different user can't inherit it.
  function clear() {
    ids.value = new Set();
  }

  function seedFromPayload(recipeId: number, isFavorited: boolean) {
    if (isFavorited) ids.value.add(recipeId);
    else ids.value.delete(recipeId);
  }

  async function toggle(recipeId: number) {
    if (ids.value.has(recipeId)) {
      await remove(recipeId);
    } else {
      await add(recipeId);
    }
  }

  async function add(recipeId: number): Promise<boolean> {
    const result = await apiRequest('/users/me/favorites', 'POST', authStore.jwt, { recipeId });
    if (result.ok) ids.value.add(recipeId);
    return result.ok;
  }

  async function remove(recipeId: number): Promise<boolean> {
    const result = await apiRequest(`/users/me/favorites/${recipeId}`, 'DELETE', authStore.jwt);
    if (result.ok) ids.value.delete(recipeId);
    return result.ok;
  }

  // Same shaping as getPopulated, but for a friend's favorites. Returns all of
  // them (no pagination) so the friend profile popup can list everything.
  async function getFriendPopulated(friendId: number): Promise<ApiResponse<{ count: number; recipes: RecipePreview[] }>> {
    if (!authStore.jwt) return { ok: false, needsAuth: true, rateLimited: false };
    const result = await apiRequest<FavoritesResponse>(
      `/users/me/friends/${friendId}/favorites?populate=true`,
      'GET',
      authStore.jwt
    );
    if (!result.ok || !result.value) return { ok: false, needsAuth: result.needsAuth, rateLimited: result.rateLimited };

    const recipes = result.value.foods
      .filter(item => item.recipe !== null)
      .map(item => item.recipe as RecipePreview);

    // Backend annotates these against the current user, so seed our own state.
    recipes.forEach(r => seedFromPayload(r.id, r.isFavorited ?? false));

    return {
      ok: true,
      needsAuth: false,
      rateLimited: false,
      value: { count: result.value.count, recipes },
    };
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

    // These are the user's own favorites, so they are favorited by definition.
    recipes.forEach(r => seedFromPayload(r.id, true));

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

  return { ids, has, seedFromPayload, toggle, add, remove, getPopulated, getFriendPopulated, clear };
})

