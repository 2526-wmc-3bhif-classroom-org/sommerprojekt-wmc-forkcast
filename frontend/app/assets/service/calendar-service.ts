import useApiConnection, { type ApiResponse } from '~/assets/util/api-connector';
import useAuthService from '~/assets/service/auth-service';
import type { CalendarEntry } from '~/assets/model/calendar-entry';

export default function useCalendarService() {
    const connection = useApiConnection();
    const auth = useAuthService();

    async function handleAuth<T>(result: ApiResponse<T>): Promise<ApiResponse<T>> {
        if (result.needsAuth) await auth.logout();
        return result;
    }

    async function getEntries(): Promise<ApiResponse<CalendarEntry[]>> {
        if (!auth.authenticated.value) throw Error('Not authenticated');
        return handleAuth(
            await connection.apiRequest<CalendarEntry[]>('/users/me/calendar', 'GET', auth.jwt.value)
        );
    }

    async function getEntry(id: number): Promise<ApiResponse<CalendarEntry>> {
        if (!auth.authenticated.value) throw Error('Not authenticated');
        return handleAuth(
            await connection.apiRequest<CalendarEntry>(`/users/me/calendar/${id}`, 'GET', auth.jwt.value)
        );
    }

    async function addEntry(recipeId: number, date: Date): Promise<ApiResponse<CalendarEntry>> {
        if (!auth.authenticated.value) throw Error('Not authenticated');
        return handleAuth(
            await connection.apiRequest<CalendarEntry>(
                '/users/me/calendar',
                'POST',
                auth.jwt.value,
                { recipeId, date: date.toISOString() }
            )
        );
    }

    async function deleteEntry(id: number): Promise<ApiResponse<void>> {
        if (!auth.authenticated.value) throw Error('Not authenticated');
        return handleAuth(
            await connection.apiRequest<void>(
                `/users/me/calendar/${id}`,
                'DELETE',
                auth.jwt.value,
                undefined,
                false
            )
        );
    }

    return { getEntries, getEntry, addEntry, deleteEntry };
}
