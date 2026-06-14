import useApiConnection, { type ApiResponse } from '~/assets/util/api-connector';
import { useAuthStore } from '~/assets/store/auth-store';
import { useRecipeStore } from '~/assets/store/recipe-store';
import type { CalendarEntry } from '~/assets/model/calendar-entry';

const NOT_AUTH: ApiResponse<never> = { ok: false, needsAuth: true, rateLimited: false };

export const useCalendarStore = defineStore('calendarStore', () => {
  const { apiRequest } = useApiConnection();
  const authStore = useAuthStore();

  const entriesByDate = reactive<Record<string, CalendarEntry[]>>({});
  const fetchedWeeks = new Set<string>();

  const authenticated = computed(() => !authStore.loading && authStore.jwt !== undefined);
  const recipeStore = useRecipeStore();

  async function logout() {
    authStore.user = undefined;
    authStore.jwt = undefined;
  }

  // Drop all cached calendar data so a different user can't see the previous user's entries.
  function clear() {
    for (const key of Object.keys(entriesByDate)) delete entriesByDate[key];
    fetchedWeeks.clear();
  }

  // Use local YYYY-MM-DD keys (matches ScheduleCalendarComponent.toDateKey)
  function toLocalDateKey(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Compute week start (Monday) key for a given date (local) — matches component logic
  function weekStartKeyFromDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    d.setHours(12, 0, 0, 0); // avoid UTC boundary issues
    return toLocalDateKey(d);
  }

  function ensureDate(key: string) {
    if (!entriesByDate[key]) entriesByDate[key] = [];
  }

  async function getEntries(from: string, to: string): Promise<ApiResponse<CalendarEntry[]>> {
    if (!authenticated.value) return NOT_AUTH;

    // If the week is already fetched, serve from in-memory cache
    if (fetchedWeeks.has(from)) {
      const all: CalendarEntry[] = [];
      for (const key of Object.keys(entriesByDate)) {
        if (key >= from && key <= to) all.push(...(entriesByDate[key] ?? []));
      }
      return { ok: true, needsAuth: false, rateLimited: false, value: all };
    }

    const params = new URLSearchParams({ populate: 'true', from, to });
    const result = await apiRequest<CalendarEntry[]>(`/users/me/calendar?${params}`, 'GET', authStore.jwt);
    if (result.needsAuth) { await logout(); return result; }
    if (result.rateLimited) return result;

    if (result.ok && result.value) {
      // mark the requested week as fetched so UI won't refetch repeatedly
      fetchedWeeks.add(from);
      for (const entry of result.value) {
        const key = toLocalDateKey(entry.date);
        ensureDate(key);

        // If the server returned recipe details, cache them in the recipe store for reuse
        if (entry.recipe && entry.recipe.id) {
          recipeStore.byId[entry.recipe.id] = entry.recipe as any;
          // ensure the calendar entry references the shared preview object
          entry.recipe = recipeStore.byId[entry.recipe.id];
        }

        if (!entriesByDate[key]!.some(e => e.id === entry.id)) {
          entriesByDate[key]!.push(entry);
        } else {
          // If an entry with same id exists, replace to keep data fresh
          const idx = entriesByDate[key]!.findIndex(e => e.id === entry.id);
          if (idx !== -1) entriesByDate[key]![idx] = entry;
        }
      }
    }
    return result;
  }

  // Add entry to the server and update cache on success.
  async function addEntry(recipeId: number, date: Date): Promise<ApiResponse<CalendarEntry>> {
    if (!authenticated.value) return NOT_AUTH;

    const result = await apiRequest<CalendarEntry>('/users/me/calendar', 'POST', authStore.jwt, { recipeId, date: date.toISOString() });
    if (result.needsAuth) { await logout(); return result; }

    if (result.ok && result.value) {
      const key = toLocalDateKey(result.value.date);
      ensureDate(key);

      // If server returned recipe preview, cache it and reference shared object
      if (result.value.recipe && result.value.recipe.id) {
        recipeStore.byId[result.value.recipe.id] = result.value.recipe as any;
        result.value.recipe = recipeStore.byId[result.value.recipe.id];
      } else {
        // If server didn't include recipe, try to use cached version
        const cachedRecipe = recipeStore.byId[recipeId];
        if (cachedRecipe) {
          result.value.recipe = cachedRecipe;
        }
      }

      // Add entry to cache if not already present
      if (!entriesByDate[key]!.some(e => e.id === result.value.id)) {
        entriesByDate[key]!.push(result.value);
      }

      // Mark the week as fetched
      const weekKey = weekStartKeyFromDate(date);
      fetchedWeeks.add(weekKey);
    }

    return result;
  }

  async function deleteEntry(id: number): Promise<ApiResponse<void>> {
    if (!authenticated.value) return NOT_AUTH;
    const result = await apiRequest<void>(`/users/me/calendar/${id}`, 'DELETE', authStore.jwt, undefined, false);
    if (result.needsAuth) { await logout(); return result; }
    if (result.ok) {
      for (const key of Object.keys(entriesByDate)) {
        const idx = entriesByDate[key]?.findIndex(e => e.id === id) ?? -1;
        if (idx !== -1) { entriesByDate[key]!.splice(idx, 1); break; }
      }
    }
    return result;
  }

  return { entriesByDate, fetchedWeeks, getEntries, addEntry, deleteEntry, clear };
});
