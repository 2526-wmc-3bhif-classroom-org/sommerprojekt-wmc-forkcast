<script setup lang="ts">
import FullScreenErrorComponent from "~/components/FullScreenErrorComponent.vue";
import useAuthService from "~/assets/service/auth-service";

const authService = useAuthService()
</script>

<template>
  <unauthenticated-navbar-component v-if="authService.userLoaded" class="z-100"/>
  <div>
    <nuxt-error-boundary>
      <slot/>
      <template #error="{ error, clearError }">
        <full-screen-error-component :error="error" :clear-error="clearError"/>
      </template>
    </nuxt-error-boundary>
  </div>
  <footer-component/>
</template>