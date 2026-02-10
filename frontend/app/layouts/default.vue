<script setup lang="ts">
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
  <NavbarComponent/>
  <div class="m-5">
    <slot/>
  </div>
  <FooterComponent/>
</template>