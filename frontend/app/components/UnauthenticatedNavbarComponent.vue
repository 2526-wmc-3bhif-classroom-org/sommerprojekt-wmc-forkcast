<script setup lang="ts">
</script>
<template>
  <div class="fixed top-0 navbar bg-transparent shadow-sm">
    <div class="flex-1">
      <NuxtLink to="/" class="btn btn-ghost text-xl"><i class="fa-solid fa-utensils"></i>Forkcast</NuxtLink>
    </div>
    <div class="flex-none">
      <NuxtLink to="/auth/register" class="btn btn-primary mr-2">
        <i class="fa-solid fa-user-plus"/>
        <span class="hidden md:block md:ml-1">Start Planning Free</span>
      </NuxtLink>
      <NuxtLink to="/auth/login" class="btn btn-soft">
        <i class="fa-solid fa-user-check"/>
        <span class="hidden md:block md:ml-1">Login</span>
      </NuxtLink>
    </div>
  </div>
</template>