<script setup lang="ts">
const route = useRoute();

const { data, error } = await useAsyncData('privacy-policy-legal', () => {
  return queryCollection('legal').path('/privacy-policy').first()
})
</script>

<template>
  <LegalPagesComponent>
    <div v-if="error" class="alert alert-error mb-4">
      <span>Error loading content: {{ error }}</span>
    </div>

    <ContentRenderer v-if="data" :value="data" />

    <div v-else class="text-center py-12 opacity-60">
      <h3 class="font-bold text-lg">Content Unavailable</h3>
      <p class="mt-2">If you actully see this message, please restart your development server.</p>
      <p class="text-xs mt-1 font-mono">Collection: legal | Path: /privacy-policy</p>
    </div>
  </LegalPagesComponent>
</template>