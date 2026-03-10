<script setup lang="ts">
defineProps(["error", "clearError"])
</script>

<template>
  <div class="hero bg-base-100 min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">An error occurred!</h1>
        <p class="text-sm">{{error}}</p>

        <p class="py-6">
          The content you tried to request had problems while trying to display it.
          Please try again later and file a report if the issue persists.
        </p>

        <button class="btn btn-primary" @click="clearError">
          <i class="fa-solid fa-arrow-rotate-right"></i>
          Retry
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>