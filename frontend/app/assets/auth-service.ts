import {getCurrentUser, loginUser, logoutUser, registerUser} from "~/assets/api-connector";
import type {Failure} from "~/assets/model/failure";
import type {User} from "~/assets/model/user";

export default function useAuthService() {
    const user = ref<User | null>(null)
    const authenticated = computed(() => user.value !== null);

    async function logout() {
        if (!authenticated.value) throw Error("Not authenticated");

        let result = await logoutUser();
        if (result === null) {
            user.value = null;
            return null;
        } else {
            return result as Failure;
        }
    }

    async function reloadUser() {
        let result = await getCurrentUser();

        if (result && "id" in result) {
            user.value = result as User;
        } else {
            user.value = null; // Clear user if not authenticated or error occurs
        }
    }

    async function login(email: string, password: string) {
        if (authenticated.value) throw Error("Already authenticated");

        let result = await loginUser(email, password);
        if (result && "id" in result) {
            user.value = result as User;
            return null;
        } else {
            return result as Failure;
        }
    }

    async function register(username: string, email: string, password: string) {
        if (authenticated.value) throw Error("Already authenticated");

        let result = await registerUser(username, email, password);
        if (result && "id" in result) {
            // Automatically log in the user after successful registration
            await login(email, password);
            return null;
        } else {
            return result as Failure;
        }
    }

    return {
        user,
        authenticated,
        login,
        logout,
        register,
        reloadUser
    };
}