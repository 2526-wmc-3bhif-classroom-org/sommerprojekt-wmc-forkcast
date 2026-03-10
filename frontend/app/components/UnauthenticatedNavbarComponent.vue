<script setup lang="ts">
</script>
<template>
  <!-- Loading indicator for page switches -->
  <NuxtLoadingIndicator color="var(--color-primary)" :height="2" :throttle="0" />

  <div class="fixed top-0 navbar bg-transparent shadow-sm">
    <div class="flex-1">
      <NuxtLink to="/" class="btn btn-ghost text-xl"><i class="fa-solid fa-utensils"></i>Forkcast</NuxtLink>
    </div>
    <div class="flex-none">
      <NuxtLink to="/auth/register" class="btn btn-primary mr-2">
        <i class="fa-solid fa-user-plus mr-1"/>
        Start Planning Free
      </NuxtLink>
      <NuxtLink to="/auth/login" class="btn btn-soft">
        <i class="fa-solid fa-user-check mr-1"/>
        Login
      </NuxtLink>
    </div>
  </div>
</template>