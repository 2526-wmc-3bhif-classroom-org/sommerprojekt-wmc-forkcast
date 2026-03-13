import type {User} from "~/assets/model/user";
import type {Failure} from "~/assets/model/failure";

const API_BASE_URL = "http://localhost:3000/api";

export async function registerUser(name: string, email: string, password: string) {
    try {
        const response = await fetch(API_BASE_URL + "/auth/register", {
            method: "POST",
            credentials: "include", // Include cookies in the request
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
            return await response.json() as Failure;
        }

        return await response.json() as User
    } catch (error) {
        return { message: "An error occurred during registration: " + error } as Failure;
    }
}

export async function loginUser(email: string, password: string) {
    try {
        const response = await fetch(API_BASE_URL + "/auth/login", {
            method: "POST",
            credentials: "include", // Include cookies in the request
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            return await response.json() as Failure;
        }

        return await response.json() as User;
    } catch (error) {
        return { message: "An error occurred during login: " + error } as Failure;
    }
}

export async function logoutUser() {
    try {
        const response = await fetch(API_BASE_URL + "/auth/logout", {
            method: "POST",
            credentials: "include" // Include cookies in the request
        });

        if (!response.ok) {
            return await response.json() as Failure;
        }

        return null; // Logout successful
    } catch (error) {
        return { message: "An error occurred during logout: " + error } as Failure;
    }
}

export async function getCurrentUser() {
    try {
        const response = await fetch(API_BASE_URL + "/users/me", {
            method: "GET",
            credentials: "include" // Include cookies in the request TODO: Backend switch to cookie-based auth
        });

        if (!response.ok) {
            return null; // Not authenticated
        }

        return await response.json() as User;
    } catch (error) {
        return null; // Not authenticated or an error occurred
    }
}