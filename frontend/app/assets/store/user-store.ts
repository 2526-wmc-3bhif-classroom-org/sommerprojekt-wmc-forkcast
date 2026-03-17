import type {User} from "~/assets/model/user";

export const useUserStore = defineStore('userStore', {
    state: () => ({
        user: undefined as User | undefined,
        loading: true,
    })
})