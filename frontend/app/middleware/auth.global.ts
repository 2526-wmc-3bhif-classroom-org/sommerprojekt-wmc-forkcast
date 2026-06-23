import useAuthService from "~/assets/service/auth-service";

// Auth is resolved on the client by the auth.client plugin before the app
// mounts. This middleware only guards client-side navigations; the server can't
// know auth state (jwt lives in sessionStorage), so it never runs there.
export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return;

    const authService = useAuthService();

    if (authService.authenticated.value && to.path.startsWith("/auth")) {
        return navigateTo("/dashboard");
    }

    if (!authService.authenticated.value && to.path.startsWith("/dashboard")) {
        // Remember where the user was headed (incl. query, e.g. a share link) so
        // login/register can send them back there afterwards.
        return navigateTo({ path: "/auth/login", query: { redirect: to.fullPath } });
    }
});
