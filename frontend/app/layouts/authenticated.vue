<script setup lang="ts">
</script>
<template>
  <navbar-component class="z-100"/>
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