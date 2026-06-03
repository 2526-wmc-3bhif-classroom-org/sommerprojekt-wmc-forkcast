import useApiConnection, { type ApiResponse } from '~/assets/util/api-connector';
import { useAuthStore } from '~/assets/store/auth-store';
import type { CalendarEntry } from '~/assets/model/calendar-entry';

const NOT_AUTH: ApiResponse<never> = { ok: false, needsAuth: true, rateLimited: false };

export const useCalendarStore = defineStore('calendarStore', () => {
  const { apiRequest } = useApiConnection();
  const authStore = useAuthStore();

  const entriesByDate = reactive<Record<string, CalendarEntry[]>>({});
  const fetchedWeeks = new Set<string>();

  const authenticated = computed(() => !authStore.loading && authStore.jwt !== undefined);

  async function logout() {
    authStore.user = undefined;
    authStore.jwt = undefined;
  }

  function getDateKey(date: Date | string): string {
    const d = typeof date === 'string' ? date : date.toISOString();
    return d.slice(0, 10);
  }

  function ensureDate(key: string) {
    if (!entriesByDate[key]) entriesByDate[key] = [];
  }

  async function getEntries(from: string, to: string): Promise<ApiResponse<CalendarEntry[]>> {
    if (!authenticated.value) return NOT_AUTH;
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
      fetchedWeeks.add(from);
      for (const entry of result.value) {
        const key = getDateKey(entry.date);
        ensureDate(key);
        if (!entriesByDate[key]!.some(e => e.id === entry.id)) {
          entriesByDate[key]!.push(entry);
        }
      }
    }
    return result;
  }

  async function addEntry(recipeId: number, date: Date): Promise<ApiResponse<CalendarEntry>> {
    if (!authenticated.value) return NOT_AUTH;
    const result = await apiRequest<CalendarEntry>('/users/me/calendar', 'POST', authStore.jwt, { recipeId, date: date.toISOString() });
    if (result.needsAuth) { await logout(); return result; }
    if (result.ok && result.value) {
      const key = getDateKey(result.value.date);
      ensureDate(key);
      entriesByDate[key]!.push(result.value);
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

  return { entriesByDate, fetchedWeeks, getEntries, addEntry, deleteEntry };
});
