import useAuthService from "~/assets/service/auth-service";

export default defineNuxtRouteMiddleware(async (to, from) => {
    let authService = useAuthService()

    if (authService.authenticated.value && to.path.startsWith("/auth")) {
        return navigateTo("/dashboard");
    }

    if (!authService.authenticated.value && to.path.startsWith("/dashboard")) {
        return navigateTo("/auth/login");
    }
})