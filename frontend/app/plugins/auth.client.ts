import useAuthService from "~/assets/service/auth-service";

// Auth lives in sessionStorage (client only), so the server always renders
// logged-out. Resolve auth here on the client before the app mounts so pages
// have the user on a hard load, and redirect the initial route if needed.
// Subsequent client navigations are handled by the auth.global middleware.
export default defineNuxtPlugin(async () => {
    const authService = useAuthService();
    await authService.loadUserWithExistingJwt();

    const route = useRoute();
    if (authService.authenticated.value && route.path.startsWith("/auth")) {
        await navigateTo("/dashboard");
    } else if (!authService.authenticated.value && route.path.startsWith("/dashboard")) {
        await navigateTo("/auth/login");
    }
});
