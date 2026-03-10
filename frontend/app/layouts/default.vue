<script setup lang="ts">
import FullScreenErrorComponent from "~/components/FullScreenErrorComponent.vue";

useHead({
  script: [
    {
      src: "https://kit.fontawesome.com/0a7e2ccef9.js",
      crossorigin: "anonymous"
    },
    {
      src: "https://unpkg.com/cally",
      type: "module"
    }
  ]
})
</script>

<template>
  <NavbarComponent/>
  <div class="m-5">
    <NuxtErrorBoundary>
      <slot/>
      <template #error="{ error, clearError }">
        <FullScreenErrorComponent :error="error" :clear-error="clearError"/>
      </template>
    </NuxtErrorBoundary>
  </div>
  <FooterComponent/>
</template>