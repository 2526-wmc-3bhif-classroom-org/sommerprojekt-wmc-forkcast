<script lang="ts" setup>
import useAuthService from "~/assets/auth-service";

const route = useRoute()
const authService = useAuthService()

const title = computed(() => route.meta.title ? "Forkcast - " + route.meta.title : "Forkcast")
const description = computed(() => route.meta.description ? route.meta.description as string : "Forkcast is the #1 solution for meal planning and cooking.")
const layoutName = computed(() => authService.authenticated.value ? 'authenticated' : 'unauthenticated')

useSeoMeta({
  title: title,
  ogTitle: title,
  description: description,
  ogDescription: description,
})

onMounted(async () => {
  await authService.reloadUser()
})

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
  ],
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
