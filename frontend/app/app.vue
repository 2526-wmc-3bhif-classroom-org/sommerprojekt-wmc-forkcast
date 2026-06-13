<script lang="ts" setup>
import useAuthService from "~/assets/service/auth-service";

const route = useRoute();
const router = useRouter();
const { locale } = useI18n();
const authService = useAuthService();

const basePath = computed(() => {
  const prefix = `/${locale.value}`;
  return route.path.startsWith(prefix) ? route.path.slice(prefix.length) || '/' : route.path;
});

const titleTranslation = computed(() => $t("route." + basePath.value));
const descriptionTranslation = computed(() => $t("route." + basePath.value + ".desc"));

const title = computed(() => titleTranslation.value ? "Forkcast - " + titleTranslation.value : "Forkcast");
const description = computed(() => descriptionTranslation.value ? descriptionTranslation.value as string : "");
const layoutName = computed(() => authService.authenticated.value ? 'authenticated' : 'unauthenticated');
const initializing = computed(() => authService.loading.value);

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
  },
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/sommerprojekt-wmc-forkcast/logo.svg"
    }
  ]
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
    <NuxtPage v-if="!initializing"/>
    <div v-else class="flex min-h-screen items-center justify-center">
      <span class="loading loading-spinner loading-lg text-primary"/>
    </div>
  </NuxtLayout>
</template>
