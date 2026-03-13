import {loginUser, registerUser} from "~/assets/api-connector";
import type {Failure} from "~/assets/model/failure";

export default function useAuthService() {
    const cookie = useCookie("jwt", { path: "/" });

    function isAuthenticated() {
        console.log(cookie.value) //TODO: #15 Needs removal oh HttpOnly cookie
        return cookie.value !== undefined;
    }

    function logout() {
        cookie.value = null;
    }

    async function login(email: string, password: string) {
        if (isAuthenticated()) throw Error("Already authenticated");

        let result = await loginUser(email, password);
        if (result && "id" in result) {
            return null;
        } else {
            return result as Failure;
        }
    }

    async function register(username: string, email: string, password: string) {
        if (isAuthenticated()) throw Error("Already authenticated");

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
        isAuthenticated,
        login,
        logout,
        register
    };
}