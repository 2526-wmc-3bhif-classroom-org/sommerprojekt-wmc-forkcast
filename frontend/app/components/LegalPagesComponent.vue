<script setup lang="ts">
defineProps(["error", "clearError"]);
</script>

<template>
  <div class="container mx-auto px-4 py-24 flex justify-center">
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>
