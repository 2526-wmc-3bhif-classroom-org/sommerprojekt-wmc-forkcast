<script lang="ts" setup>
const route = useRoute();
const { locale } = useI18n();

const basePath = computed(() => {
  const prefix = `/${locale.value}`;
  return route.path.startsWith(prefix) ? route.path.slice(prefix.length) || '/' : route.path;
});

const titleTranslation = computed(() => $t("route." + basePath.value));
const descriptionTranslation = computed(() => $t("route." + basePath.value + ".desc"));

const title = computed(() => titleTranslation.value ? "Forkcast - " + titleTranslation.value : "Forkcast");
const description = computed(() => descriptionTranslation.value ? descriptionTranslation.value as string : "");

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

</script>

<template>
  <!-- Loading indicator for page switches -->
  <NuxtLoadingIndicator color="var(--color-primary)" :height="2" :throttle="0" />

  <NuxtRouteAnnouncer/>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
