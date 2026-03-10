<script setup lang="ts">
import FullScreenErrorComponent from "~/components/FullScreenErrorComponent.vue";
</script>

<template>
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