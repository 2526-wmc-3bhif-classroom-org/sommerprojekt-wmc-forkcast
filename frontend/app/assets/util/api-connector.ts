import type {Failure} from "~/assets/model/failure";
import {triggerAuthExpiry} from "~/assets/util/auth-expiry";

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiResponse<T> = {
    value?: T;
    failure?: Failure;
    ok: boolean;
    needsAuth: boolean;
    rateLimited: boolean;
};

export default function useApiConnection() {
    const baseUrl = useRuntimeConfig().public.apiBaseUrl;

    async function apiRequest<T>(
        endpoint: string,
        method: ApiMethod = "GET",
        jwt?: string,
        body?: object,
        parseBody: boolean = true
    ): Promise<ApiResponse<T>> {
        try {
            const headers: Record<string, string> = {};
            if (body) {
                headers["Content-Type"] = "application/json";
            }
            if (jwt) {
                headers["Authorization"] = `Bearer ${jwt}`;
            }

            const response = await fetch(baseUrl + endpoint, {
                method,
                headers: headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            if (response.status === 429) {
                return { ok: false, needsAuth: false, rateLimited: true, failure: { message: "Too many requests. Please wait a moment.", errors: null } };
            }

            if (response.status === 401 || response.status === 403) {
                if (import.meta.client) triggerAuthExpiry();
                return { ok: false, needsAuth: true, rateLimited: false, failure: { message: "Unauthorized", errors: null } };
            }

            if (!parseBody) {
                if (!response.ok) {
                    try {
                        const errData = await response.json();
                        return { ok: false, needsAuth: false, rateLimited: false, failure: errData as Failure };
                    } catch {
                        return { ok: false, needsAuth: false, rateLimited: false, failure: { message: `Request failed (${response.status})`, errors: null } };
                    }
                }
                return { ok: true, needsAuth: false, rateLimited: false };
            }

            const data = await response.json();

            if (!response.ok) {
                return { ok: false, needsAuth: false, rateLimited: false, failure: data as Failure };
            }
            return { ok: true, needsAuth: false, rateLimited: false, value: data as T };
        } catch (error) {
            return { ok: false, needsAuth: false, rateLimited: false, failure: { message: "Network error: " + error, errors: null } };
        }
    }

    return {
        apiRequest,
    };
}