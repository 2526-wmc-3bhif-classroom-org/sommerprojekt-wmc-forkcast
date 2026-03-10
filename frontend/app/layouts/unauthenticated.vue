<script setup lang="ts">
import FullScreenErrorComponent from "~/components/FullScreenErrorComponent.vue";
import UnauthenticatedNavbarComponent from "~/components/UnauthenticatedNavbarComponent.vue";
</script>

<template>
  <UnauthenticatedNavbarComponent/>
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