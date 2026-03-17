import type {Failure} from "~/assets/model/failure";

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

export type ApiResponse<T> = {
    value?: T;
    failure?: Failure;
    ok: boolean;
    needsAuth: boolean;
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

            if (!parseBody) {
                if (!response.ok) {
                    if (response.status === 401) {
                        return { ok: false, needsAuth: true, failure: { message: "Unauthorized" } as Failure };
                    }

                    return { ok: false, needsAuth: false, failure: { message: "Request failed" } as Failure };
                }

                return { ok: true } as ApiResponse<T>;
            }

            const data = await response.json();

            if (!response.ok) {
                return { ok: false, needsAuth: false, failure: data as Failure };
            }
            return { ok: true, needsAuth: false, value: data as T };
        } catch (error) {
            return { ok: false, needsAuth: false, failure: { message: "Network error: " + error } as Failure };
        }
    }

    return {
        apiRequest,
    };
}