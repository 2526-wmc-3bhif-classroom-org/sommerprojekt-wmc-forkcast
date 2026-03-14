import type {Failure} from "~/assets/model/failure";

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

type ApiResponse<T> = {
    value?: T
    failure?: Failure
    ok: boolean
};

export default function useApiConnection() {
    const baseUrl = useRuntimeConfig().app.apiBaseUrl;

    async function apiRequest<T>(
        endpoint: string,
        method: ApiMethod = "GET",
        body?: object,
        parseBody: boolean = true // Add this parameter
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(baseUrl + endpoint, {
                method,
                credentials: "include",
                headers: body ? { "Content-Type": "application/json" } : undefined,
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!parseBody) {
                if (!response.ok) {
                    return { ok: false, failure: { message: "Request failed" } as Failure };
                }
                return { ok: true } as ApiResponse<T>;
            }

            const data = await response.json();

            if (!response.ok) {
                return { ok: false, failure: data as Failure };
            }
            return { ok: true, value: data as T };
        } catch (error) {
            return { ok: false, failure: { message: "Network error: " + error } as Failure };
        }
    }

    return {
        apiRequest,
    }
}