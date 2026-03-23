<script setup lang="ts">
const props = defineProps(["src"])

// This will be pre-rendered in the production build.
const { data: md } = await useAsyncData(`content-${props.src.value}`, () => {
  return $fetch('/api/get-content', {query: { src: props.src }})
}, {
  watch: [props.src]
})
</script>

<template>
  <div class="container mx-auto p-10 my-10 md:p-30 w-full pb-0 flex justify-center">
    <MDC v-if="md" class="prose prose-sm md:prose-xl" :value="md" />
  </div>
</template>