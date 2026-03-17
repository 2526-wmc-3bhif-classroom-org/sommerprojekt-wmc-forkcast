<script lang="ts" setup>
import useAuthService from "~/assets/service/auth-service";

const route = useRoute();
const router = useRouter();
const { locale } = useI18n();
const authService = useAuthService();

const title = computed(() => route.meta.title ? "Forkcast - " + route.meta.title : "Forkcast");
const description = computed(() => route.meta.description ? route.meta.description as string : "Forkcast is the #1 solution for meal planning and cooking.");
const layoutName = computed(() => authService.authenticated.value ? 'authenticated' : 'unauthenticated');

useSeoMeta({
  title: title,
  ogTitle: title,
  description: description,
  ogDescription: description,
});

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
  htmlAttrs: {
    lang: locale
  }
});

onMounted(async () => {
  await authService.loadUserWithExistingJwt()

  if (authService.authenticated.value && route.path.startsWith("/auth")) {
     await router.push("/dashboard");
  }

  if (!authService.authenticated.value && route.path.startsWith("/dashboard")) {
    await router.push("/auth/login");
  }
});

</script>

<template>
  <!-- Loading indicator for page switches -->
  <NuxtLoadingIndicator color="var(--color-primary)" :height="2" :throttle="0" />

  <NuxtRouteAnnouncer/>
  <NuxtLayout :name="layoutName">
    <NuxtPage/>
  </NuxtLayout>
</template>
