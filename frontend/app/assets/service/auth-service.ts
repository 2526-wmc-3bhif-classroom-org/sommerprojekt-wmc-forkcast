import type {User} from "~/assets/model/user";
import useApiConnection from "~/assets/util/api-connector";
import type {AuthResponse} from "~/assets/model/auth-response";
import {useJwtStore} from "~/assets/store/jwt-store";
import {useUserStore} from "~/assets/store/user-store";

export default function useAuthService() {
    const connection = useApiConnection();
    const jwtStore = useJwtStore();
    const userStore = useUserStore();

    const loading = computed(() => userStore.loading);
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
        if (!jwtStore.jwt) {
            userStore.loading = false;
            return { ok: false, error: "No JWT found" };
        }

        let result = await getUserWithExistingJwt();

        if (result.ok) {
            userStore.user = result.value as User;
        } else {
            await clearAuthState(); // If the JWT is invalid or expired, clear the auth state to prevent using an invalid token
        }

        userStore.loading = false; // Set loading to false after attempting to load the user
        return result;
    }

    async function login(identifier: string, password: string) {
        if (authenticated.value) throw Error("Already authenticated");

        let result = await loginUser(identifier, password);
        if (result.ok) {
            await setAuthState(result.value as AuthResponse);
        }

        return result;
    }

    async function verify(email: string, password: string, code: string) {
        if (authenticated.value) throw Error("Already authenticated");

        let result = await verifyUser(email, code);
        if (result.ok) {
            await login(email, password); // Automatically log in the user after successful verification
        }

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
        return connection.apiRequest<User>("/users/me", "GET", jwtStore.jwt);
    }

    return {
        authenticated,
        loading,
        login,
        logout,
        signup,
        verify,
        loadUserWithExistingJwt
    };
}