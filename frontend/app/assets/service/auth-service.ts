import type {User} from "~/assets/model/user";
import useApiConnection from "~/assets/util/api-connector";

export default function useAuthService() {
    const connection = useApiConnection();

    const userLoaded = useState<boolean>("userLoading", () => false);

    // State to hold the current user information persistently across the application
    const user = useState<User | undefined>("user", () => undefined);

    const authenticated = computed(() => user.value !== undefined);

    async function logout() {
        if (!authenticated.value) throw Error("Not authenticated");

        let result = await logoutUser();
        if (result.ok) {
            user.value = undefined;
        }

        return result;
    }

    async function reloadUser() {
        let result = await getCurrentUser();

        if (result.ok) {
            user.value = result.value;
        } else {
            user.value = undefined; // Clear user if not authenticated or error occurs
        }

        userLoaded.value = true;

        return result;
    }

    async function login(email: string, password: string) {
        if (authenticated.value) throw Error("Already authenticated");

        let result = await loginUser(email, password);
        if (result.ok) {
            user.value = result.value;
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
        return connection.apiRequest<User>("/auth/register", "POST", { name, email, password });
    }

    function loginUser(email: string, password: string) {
        return connection.apiRequest<User>("/auth/login", "POST", { email, password });
    }

    function logoutUser() {
        return connection.apiRequest<void>("/auth/logout", "POST");
    }

    function getCurrentUser() {
        return connection.apiRequest<User>("/users/me", "GET");
    }

    return {
        user,
        userLoaded,
        authenticated,
        login,
        logout,
        register,
        reloadUser
    };
}