<script lang="ts" setup>
import useAuthService from "~/assets/auth-service";

useHead({
  script: [
    {
      src: "https://kit.fontawesome.com/0a7e2ccef9.js", // Font Awesome - Icon library
      crossorigin: "anonymous"
    },
    {
      src: "https://unpkg.com/cally", // Cally - Calendar and time picker
      type: "module"
    }
  ]
})

const authService = useAuthService()

const layoutName = computed(() => authService.authenticated.value ? 'authenticated' : 'unauthenticated')

onMounted(async () => {
  await authService.reloadUser()
})
</script>

<template>
  <!-- Loading indicator for page switches -->
  <NuxtLoadingIndicator color="var(--color-primary)" :height="2" :throttle="0" />

  <NuxtRouteAnnouncer/>
  <NuxtLayout :name="layoutName">
    <NuxtPage/>
  </NuxtLayout>
</template>
