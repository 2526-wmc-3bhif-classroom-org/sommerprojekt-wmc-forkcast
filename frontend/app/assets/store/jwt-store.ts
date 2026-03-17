export const useJwtStore = defineStore('jwtStore', {
    state: () => ({
        jwt: undefined as string | undefined
    }),
    persist: {
        storage: piniaPluginPersistedstate.sessionStorage(),
        pick: ['jwt'],
    }
})