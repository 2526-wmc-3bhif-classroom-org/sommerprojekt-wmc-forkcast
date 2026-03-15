<script setup lang="ts">
const { locales, setLocale } = useI18n()
</script>
<template>
  <div class="fixed top-0 navbar bg-transparent shadow-sm">
    <div class="flex-1">
      <nuxt-link-locale to="/" class="btn btn-ghost text-xl"><i class="fa-solid fa-utensils"></i>{{$t('component.navbar.title')}}</nuxt-link-locale>
    </div>
    <div class="flex-none">
      <div class="dropdown dropdown-end mr-2">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <i class="fa-solid fa-language"></i>
        </div>
        <ul tabindex="-1" class="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 p-2 shadow">
          <li v-for="locale in locales"><span @click="setLocale(locale.code)"><i class="fa-solid fa-language"></i>{{ locale.name }}</span></li>
        </ul>
      </div>
      <nuxt-link-locale to="/auth/signup" class="btn btn-primary mr-2">
        <i class="fa-solid fa-user-plus"/>
        <span class="hidden md:block md:ml-1">{{$t('component.navbar.prompt_signup')}}</span>
      </nuxt-link-locale>
      <nuxt-link-locale to="/auth/login" class="btn btn-soft">
        <i class="fa-solid fa-user-check"/>
        <span class="hidden md:block md:ml-1">{{$t('component.navbar.prompt_login')}}</span>
      </nuxt-link-locale>
    </div>
  </div>
</template>