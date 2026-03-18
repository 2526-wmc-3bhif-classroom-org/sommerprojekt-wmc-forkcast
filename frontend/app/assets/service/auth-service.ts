import type {User} from "~/assets/model/user";
import useApiConnection from "~/assets/util/api-connector";
import type {AuthResponse} from "~/assets/model/auth-response";
import {useJwtStore} from "~/assets/store/jwt-store";
import {useUserStore} from "~/assets/store/user-store";

export default function useAuthService() {
    const connection = useApiConnection();
    const jwtStore = useJwtStore();
    const userStore = useUserStore();

    const authenticated = computed(() => !userStore.loading && jwtStore.jwt !== undefined);

    async function clearAuthState() {
        userStore.user = undefined
        jwtStore.jwt = undefined;
    }

    async function setAuthState(res: AuthResponse) {
        userStore.user = res.user;
        jwtStore.jwt = res.token;
    }

    async function logout() {
        if (!authenticated.value) throw Error("Not authenticated");

        await clearAuthState();
    }

    async function loadUserWithExistingJwt() {
        let result = await getUserWithExistingJwt();

        if (result.ok) {
            userStore.user = result.value as User;
        } else {
            await clearAuthState(); // If the JWT is invalid or expired, clear the auth state to prevent using an invalid token
        }

        userStore.loading = false; // Set loading to false after attempting to load the user
        return result;
    }

    async function login(email: string, password: string) {
        if (authenticated.value) throw Error("Already authenticated");

        let result = await loginUser(email, password);
        if (result.ok) {
            await setAuthState(result.value as AuthResponse);
        }

        return result;
    }

    async function register(username: string, email: string, password: string) {
        if (authenticated.value) throw Error("Already authenticated");

        let result = await registerUser(username, email, password);
        if (result.ok) {
            // Automatically log in the user after successful registration
            await login(email, password);
        }

        return result;
    }

    function registerUser(name: string, email: string, password: string) {
        return connection.apiRequest<User>("/auth/register", "POST", undefined, { name, email, password });
    }

    function loginUser(email: string, password: string) {
        return connection.apiRequest<AuthResponse>("/auth/login", "POST", undefined, { email, password });
    }

    function getUserWithExistingJwt() {
        return connection.apiRequest<User>("/users/me", "GET", jwtStore.jwt);
    }

    return {
        authenticated,
        login,
        logout,
        register,
        loadUserWithExistingJwt
    };
}