import useApiConnection, { type ApiResponse } from "~/assets/util/api-connector";
import { useAuthStore } from "~/assets/store/auth-store";
import type { PublicUser, IncomingRequest } from "~/assets/model/public-user";

export type SendRequestResult = { status: "pending" | "accepted"; user: PublicUser };

export default function useFriendService() {
    const { apiRequest } = useApiConnection();
    const authStore = useAuthStore();

    function getFriends(): Promise<ApiResponse<PublicUser[]>> {
        return apiRequest<PublicUser[]>("/users/me/friends", "GET", authStore.jwt);
    }

    function getRequests(): Promise<ApiResponse<IncomingRequest[]>> {
        return apiRequest<IncomingRequest[]>("/users/me/friends/requests", "GET", authStore.jwt);
    }

    function sendRequest(username: string): Promise<ApiResponse<SendRequestResult>> {
        return apiRequest<SendRequestResult>("/users/me/friends/requests", "POST", authStore.jwt, { username });
    }

    function acceptRequest(requestId: number): Promise<ApiResponse<PublicUser>> {
        return apiRequest<PublicUser>(`/users/me/friends/requests/${requestId}/accept`, "POST", authStore.jwt);
    }

    function declineRequest(requestId: number): Promise<ApiResponse<void>> {
        return apiRequest(`/users/me/friends/requests/${requestId}/decline`, "POST", authStore.jwt);
    }

    function getFriendFriends(friendId: number): Promise<ApiResponse<PublicUser[]>> {
        return apiRequest<PublicUser[]>(`/users/me/friends/${friendId}/friends`, "GET", authStore.jwt);
    }

    function removeFriend(friendId: number): Promise<ApiResponse<void>> {
        return apiRequest(`/users/me/friends/${friendId}`, "DELETE", authStore.jwt);
    }

    return {
        getFriends,
        getRequests,
        sendRequest,
        acceptRequest,
        declineRequest,
        getFriendFriends,
        removeFriend,
    };
}
