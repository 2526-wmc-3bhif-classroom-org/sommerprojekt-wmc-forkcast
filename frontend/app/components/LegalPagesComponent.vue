<script setup lang="ts">
const {locale} = useI18n();
const route = useRoute();

const {data: lastUpdated} = await useAsyncData(`last-updated-${route.path}`, async () => {
  if (import.meta.server) {
    try {
      const fs = await import('node:fs');
      const path = await import('node:path');

      let page = route.path;
      if (page === '/') {
        page = '/index';
      }

      // Assuming md docs are located in frontend/app/content relative to the project root, no frontend/ before app bc cwd is in frontend already
      const filePath = path.resolve(process.cwd(), 'app/content' + page + '.md');

      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return stats.mtime.toISOString();
      }
    } catch (e) {
      console.warn('Could not read file stats:', e);
    }
    return new Date().toISOString();
  }
});

const lastUpdatedDate = computed(() => {
  const dateStr = lastUpdated.value || new Date().toISOString();
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});
</script>

<template>
  <div class="container mx-auto px-4 pt-24 pb-0 flex justify-center">
    <div class="card-body">
      <slot/>
      <p class="text-sm opacity-70 mt-18">{{ $t('legalPage.site.lastUpdated') }}{{ lastUpdatedDate }}</p>
    </div>
  </div>
</template>