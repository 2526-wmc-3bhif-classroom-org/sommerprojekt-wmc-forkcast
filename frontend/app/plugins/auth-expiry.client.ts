import useAuthService from "~/assets/service/auth-service";
import { onAuthExpiry } from "~/assets/util/auth-expiry";

// Registers the central handler the api-connector fires on a 401/403 from any
// authenticated endpoint: fully log out (clears auth + calendar/favorites/recipe
// caches via auth-service) and bounce off protected routes. Runs before
// auth.client.ts (alphabetical order) so the handler is set before any request.
export default defineNuxtPlugin(() => {
    const authService = useAuthService();

    onAuthExpiry(async () => {
        if (!authService.authenticated.value) return;
        await authService.logout();
        if (window.location.pathname.includes("/dashboard")) {
            await navigateTo("/auth/login");
        }
    });
});
