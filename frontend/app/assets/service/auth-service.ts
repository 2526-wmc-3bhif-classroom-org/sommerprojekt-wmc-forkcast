import type {User} from "~/assets/model/user";
import useApiConnection from "~/assets/util/api-connector";
import type {AuthResponse} from "~/assets/model/auth-response";
import {useAuthStore} from "~/assets/store/auth-store";
import {useCalendarStore} from "~/assets/store/calendar-store";
import {useFavoritesStore} from "~/assets/store/favorites-store";
import {useRecipeStore} from "~/assets/store/recipe-store";

export default function useAuthService() {
    const connection = useApiConnection();
    const authStore = useAuthStore();
    const calendarStore = useCalendarStore();
    const favoritesStore = useFavoritesStore();
    const recipeStore = useRecipeStore();

    const loading = computed(() => authStore.loading);
    const authenticated = computed(() => !authStore.loading && authStore.jwt !== undefined);
    const jwt = computed(() => authStore.jwt);

    async function clearAuthState() {
        authStore.user = undefined;
        authStore.jwt = undefined;
        calendarStore.clear();
        favoritesStore.clear();
        recipeStore.clear();
    }

    async function setAuthState(res: AuthResponse) {
        authStore.user = res.user;
        authStore.jwt = res.token;
    }

    async function logout() {
        if (!authenticated.value) return;
        await clearAuthState();
    }

    async function loadUserWithExistingJwt() {
        if (!authStore.jwt) {
            authStore.loading = false;
            return { ok: false, error: "No JWT found" };
        }

        let result = await getUserWithExistingJwt();

        if (result.ok) {
            authStore.user = result.value as User;
        } else if (result.needsAuth) {
            await clearAuthState();
        }

        authStore.loading = false;
        return result;
    }

    async function login(identifier: string, password: string) {
        if (authenticated.value) throw Error("Already authenticated");
        let result = await loginUser(identifier, password);
        if (result.ok) await setAuthState(result.value as AuthResponse);
        return result;
    }

    async function verify(email: string, password: string, code: string) {
        if (authenticated.value) throw Error("Already authenticated");
        let result = await verifyUser(email, code);
        if (result.ok) await login(email, password);
        return result;
    }

    async function signup(username: string, email: string, password: string) {
        if (authenticated.value) throw Error("Already authenticated");
        return await registerUser(username, email, password);
    }

    function registerUser(name: string, email: string, password: string) {
        return connection.apiRequest<User>("/auth/register", "POST", undefined, { name, email, password });
    }

    function loginUser(identifier: string, password: string) {
        return connection.apiRequest<AuthResponse>("/auth/login", "POST", undefined, { identifier, password });
    }

    function verifyUser(email: string, code: string) {
        return connection.apiRequest("/auth/verify", "POST", undefined, { email, code });
    }

    function getUserWithExistingJwt() {
        return connection.apiRequest<User>("/users/me", "GET", authStore.jwt);
    }

    async function updateName(name: string) {
        const result = await connection.apiRequest("/users/me/name", "PATCH", authStore.jwt, { name }, false);
        if (result.ok && authStore.user) authStore.user = { ...authStore.user, name };
        return result;
    }

    function updatePassword(currentPassword: string, newPassword: string) {
        return connection.apiRequest("/users/me/password", "PATCH", authStore.jwt, { currentPassword, newPassword }, false);
    }

    return { authenticated, loading, jwt, login, logout, signup, verify, loadUserWithExistingJwt, updateName, updatePassword };
}
