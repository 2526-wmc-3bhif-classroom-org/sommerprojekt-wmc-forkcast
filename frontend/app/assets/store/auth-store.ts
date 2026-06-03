import type { User } from '~/assets/model/user';

export const useAuthStore = defineStore('authStore', {
    state: () => ({
        jwt: undefined as string | undefined,
        user: undefined as User | undefined,
        loading: true,
    }),
    persist: {
        storage: piniaPluginPersistedstate.sessionStorage(),
        pick: ['jwt'],
    },
})
