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

  // Optimistic add: update in-memory cache immediately, then send request.
  // On success replace any optimistic placeholder with server-provided entry.
  async function addEntry(recipeId: number, date: Date): Promise<ApiResponse<CalendarEntry>> {
    if (!authenticated.value) return NOT_AUTH;

    const key = toLocalDateKey(date);
    ensureDate(key);

    // Create an optimistic placeholder entry so other parts of the app read it immediately.
    const tempId = -Date.now();
    // Try to reuse recipe preview from the recipe cache to avoid incomplete placeholders
    const cachedRecipe = recipeStore.byId[recipeId];
    const optimisticEntry: CalendarEntry = {
      id: tempId as unknown as number,
      date: date.toISOString(),
      recipe: cachedRecipe
        ? cachedRecipe
        : ({ id: recipeId, title: 'Loading…', image: '', effort: 100, tags: [], rating: { rating: 0, count: 0 }, attributes: [] } as any),
    } as CalendarEntry;

    entriesByDate[key]!.push(optimisticEntry);

    // Mark the week as fetched so UI won't attempt to refetch immediately
    const weekKey = weekStartKeyFromDate(date);
    fetchedWeeks.add(weekKey);

    const result = await apiRequest<CalendarEntry>('/users/me/calendar', 'POST', authStore.jwt, { recipeId, date: date.toISOString() });
    if (result.needsAuth) { await logout(); return result; }

    if (result.ok && result.value) {
      // If server returned recipe preview, cache it and reference shared object
      if (result.value.recipe && result.value.recipe.id) {
        recipeStore.byId[result.value.recipe.id] = result.value.recipe as any;
        result.value.recipe = recipeStore.byId[result.value.recipe.id];
      }

      // replace optimistic placeholder(s) for same recipe/date with server entry
      const serverKey = toLocalDateKey(result.value.date);
      ensureDate(serverKey);

      // Try to find a matching optimistic entry (by negative id and recipe id)
      const idx = entriesByDate[serverKey]!.findIndex(e => (e.id ?? 0) < 0 && e.recipe?.id === result.value.recipe?.id);
      if (idx !== -1) {
        entriesByDate[serverKey]![idx] = result.value;
      } else if (!entriesByDate[serverKey]!.some(e => e.id === result.value.id)) {
        entriesByDate[serverKey]!.push(result.value);
      }
    } else {
      // On failure, remove the optimistic entry we added.
      const idx = entriesByDate[key]!.findIndex(e => e.id === tempId);
      if (idx !== -1) entriesByDate[key]!.splice(idx, 1);
    }

    return result;
  }

  // Update an existing calendar entry: apply optimistically to cache and send update to server.
  async function updateEntry(id: number, patch: Partial<CalendarEntry>): Promise<ApiResponse<CalendarEntry>> {
    if (!authenticated.value) return NOT_AUTH;

    // Find entry in cache
    let foundKey: string | null = null;
    let idx = -1;
    for (const key of Object.keys(entriesByDate)) {
      const i = entriesByDate[key]!.findIndex(e => e.id === id);
      if (i !== -1) { foundKey = key; idx = i; break; }
    }

    const original = foundKey ? { ...entriesByDate[foundKey]![idx] } : null;

    if (foundKey && idx !== -1) {
      // apply patch optimistically
      entriesByDate[foundKey]![idx] = { ...entriesByDate[foundKey]![idx], ...patch } as CalendarEntry;
    }

    const result = await apiRequest<CalendarEntry>(`/users/me/calendar/${id}`, 'PUT', authStore.jwt, patch);
    if (result.needsAuth) { await logout(); return result; }

    if (result.ok && result.value) {
      // cache any returned recipe preview
      if (result.value.recipe && result.value.recipe.id) {
        recipeStore.byId[result.value.recipe.id] = result.value.recipe as any;
        result.value.recipe = recipeStore.byId[result.value.recipe.id];
      }

      const serverKey = toLocalDateKey(result.value.date);
      ensureDate(serverKey);
      // remove old if date changed
      if (foundKey && serverKey !== foundKey) {
        const removeIdx = entriesByDate[foundKey]!.findIndex(e => e.id === id);
        if (removeIdx !== -1) entriesByDate[foundKey]!.splice(removeIdx, 1);
      }
      // upsert server entry
      const existingIdx = entriesByDate[serverKey]!.findIndex(e => e.id === result.value.id);
      if (existingIdx !== -1) entriesByDate[serverKey]![existingIdx] = result.value;
      else entriesByDate[serverKey]!.push(result.value);
    } else {
      // revert optimistic change on failure
      if (foundKey && idx !== -1 && original) {
        // If original date changed, ensure correct bucket
        const currentIdx = entriesByDate[foundKey]!.findIndex(e => e.id === id);
        if (currentIdx !== -1) entriesByDate[foundKey]![currentIdx] = original;
      }
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

  return { entriesByDate, fetchedWeeks, getEntries, addEntry, updateEntry, deleteEntry };
});
