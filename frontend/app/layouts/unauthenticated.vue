<script setup lang="ts">
import FullScreenErrorComponent from "~/components/FullScreenErrorComponent.vue";
</script>

<template>
  <UnauthenticatedNavbarComponent class="z-100"/>
  <div>
    <NuxtErrorBoundary>
      <slot/>
      <template #error="{ error, clearError }">
        <FullScreenErrorComponent :error="error" :clear-error="clearError"/>
      </template>
    </NuxtErrorBoundary>
  </div>
  <FooterComponent/>
</template>