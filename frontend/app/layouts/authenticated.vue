<script setup lang="ts">
const route = useRoute();
const showNav = computed(() => route.meta.showNav ?? true);
const showFooter = computed(() => route.meta.showFooter ?? true);
</script>
<template>
  <navbar-component class="z-100" v-if="showNav"/>
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