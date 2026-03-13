import useAuthService from "~/assets/auth-service";

export default defineNuxtRouteMiddleware(async (to, from) => {
    let authService = useAuthService()

    if (!authService.authenticated.value && to.path.startsWith("/dashboard")) {
        return navigateTo("/auth/login");
    }

    if (authService.authenticated.value && to.path.startsWith("/auth")) {
        return navigateTo("/dashboard");
    }
})