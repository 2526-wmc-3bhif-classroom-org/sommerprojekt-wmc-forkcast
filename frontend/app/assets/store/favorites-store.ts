import useApiConnection from '~/assets/util/api-connector';
import { useAuthStore } from '~/assets/store/auth-store';

export const useFavoritesStore = defineStore('favoritesStore', () => {
  const { apiRequest } = useApiConnection();
  const authStore = useAuthStore();

  const ids = ref<Set<number>>(new Set());
  const loaded = ref(false);

  async function load() {
    if (loaded.value) return;
    const result = await apiRequest<{ recipeId: number }[]>('/users/me/favorites', 'GET', authStore.jwt);
    if (result.ok && result.value) {
      ids.value = new Set(result.value.map(f => f.recipeId));
      loaded.value = true;
    }
  }

  function has(recipeId: number) {
    return ids.value.has(recipeId);
  }

  async function toggle(recipeId: number) {
    if (!loaded.value) await load();
    if (ids.value.has(recipeId)) {
      const result = await apiRequest(`/users/me/favorites/${recipeId}`, 'DELETE', authStore.jwt);
      if (result.ok) ids.value.delete(recipeId);
    } else {
      const result = await apiRequest('/users/me/favorites', 'POST', authStore.jwt, { recipeId });
      if (result.ok) ids.value.add(recipeId);
    }
  }

  return { ids, loaded, load, has, toggle };
})
