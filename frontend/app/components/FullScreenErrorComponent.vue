<script setup lang="ts">
defineProps(["error", "clearError"]);
</script>

<template>
  <div class="hero bg-base-100 min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">{{$t('component.fse.title')}}</h1>
        <p class="text-sm">{{error}}</p>

        <p class="py-6">
          {{$t('component.fse.subtitle')}}
        </p>

        <button class="btn btn-primary" @click="clearError">
          <i class="fa-solid fa-arrow-rotate-right"></i>
          {{$t('component.fse.retry')}}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>