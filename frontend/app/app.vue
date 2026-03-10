<script lang="ts" setup>
useHead({
  script: [
    {
      src: "https://kit.fontawesome.com/0a7e2ccef9.js",
      crossorigin: "anonymous"
    },
    {
      src: "https://unpkg.com/cally",
      type: "module"
    }
  ]
})
</script>

<template>
  <NuxtRouteAnnouncer/>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>
