<script setup lang="ts">

const config = useRuntimeConfig();
const {locale} = useI18n();

const lastUpdatedDate = computed(() => {
  const date = new Date(config.public.privacyPolicyLastUpdated as string);
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