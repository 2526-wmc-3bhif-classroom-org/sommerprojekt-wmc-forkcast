<script setup lang="ts">
const {data: md} = await useAsyncData('privacy-policy-md', async () => {
  const {readFileSync} = await import('node:fs')
  const {resolve} = await import('node:path')

  let filePath = resolve(process.cwd(), 'app/content/privacy-policy.md')

  return readFileSync(filePath, 'utf-8')
})
</script>

<template>
  <LegalPagesComponent>
    <MDC class="prose lg:prose-xl" v-if="md" :value="md"/>
  </LegalPagesComponent>
</template>