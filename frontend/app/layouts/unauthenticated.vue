<script setup lang="ts">
import FullScreenErrorComponent from "~/components/FullScreenErrorComponent.vue";
import useAuthService from "~/assets/service/auth-service";

const authService = useAuthService()
</script>

<template>
  <UnauthenticatedNavbarComponent v-if="authService.userLoaded" class="z-100"/>
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