<script setup lang="ts">
const {locale} = useI18n();
const route = useRoute();

const md = ref<string | undefined>(undefined);

onMounted(async () => {
  try {
    let page = route.path;
    if (page === '/') {
      page = '/index';
    }

    const filePath = '/content' + page + '.md';

    const response = await fetch(filePath);
    if (response.ok) {
      md.value = await response.text();
    }

  } catch (e) {
    console.warn('Could not read file stats:', e);
  }
});
        //TODO REFACTOR FASTER LOADING -> Erik
</script>

<template>
  <div class="container mx-auto px-4 pt-24 pb-0 flex justify-center">
    <div class="card-body">
      <MDC class="prose lg:prose-xl" v-if="md" :value="md"/>
      <div v-else class="flex w-52 flex-col gap-4">
        <div class="skeleton h-32 w-100"></div>
        <div class="skeleton h-8 w-40"></div>
        <div class="skeleton h-8 w-30"></div>
        <div class="skeleton h-8 w-30"></div>
      </div>
    </div>
  </div>
</template>