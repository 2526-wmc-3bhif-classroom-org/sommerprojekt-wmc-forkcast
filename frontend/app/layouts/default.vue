<script setup lang="ts">
import useAuthService from "~/assets/service/auth-service";

const route = useRoute();
const authService = useAuthService();
const showNav = computed(() => route.meta.showNav ?? true);
const showFooter = computed(() => route.meta.showFooter ?? true);
</script>
<template>
  <client-only>
    <template v-if="showNav">
      <navbar-component v-if="authService.authenticated.value" class="z-100"/>
      <unauthenticated-navbar-component v-else class="z-100"/>
    </template>
  </client-only>
  <div>
    <nuxt-error-boundary>
      <slot/>
      <template #error="{ error, clearError }">
        <full-screen-error-component :error="error" :clear-error="clearError"/>
      </template>
    </nuxt-error-boundary>
  </div>
  <footer-component v-if="showFooter"/>
</template>
