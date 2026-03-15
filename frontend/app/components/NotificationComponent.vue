<script setup lang="ts">
const props = defineProps(["icon", "title", "description", "goto"]);

function blur() {
  (document.activeElement as HTMLElement).blur();
}
</script>

<template>
  <div class="w-full mt-2 bg-base-200 p-2 rounded-md flex flex-row items-center justify-between">
    <div class="flex flex-row items-center">
      <i v-if="props.icon" :class="'m-3 fa-solid ' + props.icon"/>
      <i v-else class="m-3 fa-solid fa-bell"/>

      <div class="flex flex-col ml-3">
        <span class="text-md">{{title}}</span>
        <span class="text-sm">{{description}}</span>
      </div>
    </div>

    <nuxt-link-locale @click="blur" class="btn btn-ghost btn-circle" :to="goto">
      <i class="fa-solid fa-arrow-right"/>
    </nuxt-link-locale>
  </div>
</template>